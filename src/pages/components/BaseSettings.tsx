// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

import { useFormik } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, VStack } from '@chakra-ui/react';
import { browser } from 'webextension-polyfill-ts';
import { useEffect } from 'react';
import { storageSyncKey_Settings } from '@src/constants';
import EngineSettings from '@src/engines/engineSettings';

interface FormValues {
  apiKey: string;
}

export default function BaseSettings() {
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
    initialValues: { apiKey: null },
    onSubmit: async (values, actions) => {
      await browser.storage.sync
        .set({
          settings: { apiKey: values.apiKey },
        })
        .then(() => {
          actions.setSubmitting(false);
          console.log('settings saved', values);
        })
        .catch(err => {
          alert(`Failed to set API key: ${err}`);
        });
    },
    validate: validate,
  });

  useEffect(() => {
    browser.storage.sync.get([storageSyncKey_Settings]).then((result: EngineSettings) => {
      console.log('load settings form storage', result);
      formik.setFieldValue('apiKey', result.apiKey);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box padding={2}>
      <form onSubmit={formik.handleSubmit}>
        <VStack>
          <FormControl id="apiKey" isInvalid={!!formik.errors.apiKey && formik.touched.apiKey}>
            <FormLabel>Access code</FormLabel>
            <Input
              {...formik.getFieldProps('apiKey')}
              onBlur={e => {
                formik.handleBlur(e);
              }}
              placeholder="Please input your access code"
            />
            <FormErrorMessage>{formik.errors.apiKey}</FormErrorMessage>
          </FormControl>
        </VStack>
        <Button mt={4} colorScheme="teal" isLoading={formik.isSubmitting} type="submit">
          Save
        </Button>
      </form>
    </Box>
  );
}
