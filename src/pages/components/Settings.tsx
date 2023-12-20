// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

import { useFormik } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, Select, VStack } from '@chakra-ui/react';
import { browser } from 'webextension-polyfill-ts';
import { useEffect, useState } from 'react';
import { fetchModels } from '@pages/common/chatgpt';
import { defaultModel, storageSyncKey_APIKey, storageSyncKey_Model } from '@src/constants';

type Props = {
  onSaved: ((values: any) => void) | null;
};

interface FormValues {
  apiKey: string;
  model: string;
}

export default function Settings({ onSaved }: Props = { onSaved: null }) {
  const [selectedModel, setSelectedModule] = useState(defaultModel);
  const [models, setModels] = useState([]);

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};
    const apiKey = values.apiKey;
    if (!apiKey) {
      errors.apiKey = 'A valid API key is required';
    } else if (!apiKey.startsWith('sk-')) {
      errors.apiKey = 'Your API key is invalid';
    }
    return errors;
  };

  const formik = useFormik({
    initialValues: { apiKey: null, model: selectedModel },
    onSubmit: async (values, actions) => {
      await browser.storage.sync
        .set({
          api_key: values.apiKey,
          model: values.model,
        })
        .then(() => {
          onSaved && onSaved(values);
          actions.setSubmitting(false);
          console.log('settings saved', values);
        })
        .catch(err => {
          alert(`Failed to set API key: ${err}`);
        });
    },
    validate: validate,
  });

  const doFetchModels = (apiKey: string) => {
    if (apiKey) {
      fetchModels(apiKey).then(fetchedModels => {
        setModels(fetchedModels);
      });
    }
  };

  useEffect(() => {
    browser.storage.sync.get([storageSyncKey_APIKey, storageSyncKey_Model]).then(result => {
      console.log('load settings form storage', result);
      formik.setFieldValue('apiKey', result[storageSyncKey_APIKey]);
      result[storageSyncKey_Model] && setSelectedModule(result[storageSyncKey_Model]);
      if (result[storageSyncKey_APIKey]) {
        doFetchModels(result[storageSyncKey_APIKey]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box padding={2}>
      <form onSubmit={formik.handleSubmit}>
        <VStack>
          <FormControl id="apiKey" isInvalid={!!formik.errors.apiKey && formik.touched.apiKey}>
            <FormLabel>API Key</FormLabel>
            <Input
              {...formik.getFieldProps('apiKey')}
              onBlur={e => {
                formik.handleBlur(e);
                !formik.errors.apiKey && doFetchModels(formik.values.apiKey);
              }}
              placeholder="Please input your API key"
            />
            <FormErrorMessage>{formik.errors.apiKey}</FormErrorMessage>
          </FormControl>
          <FormControl isDisabled={!models || models.length == 0}>
            <FormLabel>Model</FormLabel>
            <Select {...formik.getFieldProps('model')}>
              {models?.map(value => (
                <option value={value.id} key={value.id}>
                  {value.id}
                </option>
              ))}
            </Select>
          </FormControl>
        </VStack>
        <Button mt={4} colorScheme="teal" isLoading={formik.isSubmitting} type="submit">
          Submit
        </Button>
      </form>
    </Box>
  );
}
