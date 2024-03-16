// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

import { useFormik } from 'formik';
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import {
  ACCESS_CODE_PREFIX,
  LICENSE_KEY_PREFIX,
  API_KEY_PREFIX,
  globalConfigKey_ActivationData,
  globalConfigKey_EngineSettings,
} from '@src/constants';
import EngineSettings from '@src/engines/engineSettings';
import { getGlobalConfig, saveGlobalConfig } from '@pages/content/storageUtils';
import { type ActivateLicense, activateLicense } from '@lemonsqueezy/lemonsqueezy.js';
import { getDeviceId } from '@src/utils';

interface FormValues {
  apiKey: string;
}

export default function BaseSettings() {
  const [settings, setSettings] = useState<EngineSettings | null>(null);
  const [saved, setSaved] = useState(false);

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};
    const apiKey = values.apiKey;
    if (!apiKey) {
      errors.apiKey = 'A valid license key is required';
    } else if (
      !apiKey.startsWith(API_KEY_PREFIX) &&
      !apiKey.startsWith(ACCESS_CODE_PREFIX) &&
      !apiKey.startsWith(LICENSE_KEY_PREFIX)
    ) {
      errors.apiKey = 'Your license is invalid';
    }
    return errors;
  };

  const formik = useFormik({
    initialValues: { apiKey: null },
    onSubmit: async (values, actions) => {
      actions.setSubmitting(true);
      // Check the saved API key, if there's no change, don't do anything
      if (settings?.apiKey === values.apiKey) {
        actions.setSubmitting(false);
        setSaved(true);
        return;
      }

      // If the API key starts with "ak-", perform an activation
      if (values.apiKey.startsWith('ak-')) {
        // Perform activation
        const licenseKey = values.apiKey.slice(3);
        const instanceName = getDeviceId();
        const { statusCode, error, data } = await activateLicense(licenseKey, instanceName);
        if (statusCode !== 200) {
          actions.setSubmitting(false);
          alert(`Failed to activate license: ${error}`);
          return;
        }

        // Save the activation data
        const activationData: ActivateLicense = data;
        if (!activationData.activated) {
          actions.setSubmitting(false);
          alert(`Failed to activate license: ${error}`);
          return;
        }
        await saveGlobalConfig(globalConfigKey_ActivationData, activationData);

        console.log('activation');
      }

      await saveGlobalConfig(globalConfigKey_EngineSettings, { ...settings, apiKey: values.apiKey })
        .then(() => {
          actions.setSubmitting(false);
          setSaved(true);
          console.log('settings saved', values);
        })
        .catch(err => {
          alert(`Failed to set API key: ${err}`);
        });
    },
    validate: validate,
  });

  useEffect(() => {
    getGlobalConfig(globalConfigKey_EngineSettings).then((settings: EngineSettings) => {
      setSettings(settings);
      formik.setFieldValue('apiKey', settings?.apiKey);
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
                setSaved(false);
                formik.handleBlur(e);
              }}
              placeholder="Please input your access code"
            />
            <FormErrorMessage>{formik.errors.apiKey}</FormErrorMessage>
          </FormControl>
        </VStack>
        <Button mt={4} colorScheme="blue" isLoading={formik.isSubmitting} isDisabled={saved} type="submit">
          Save
        </Button>
      </form>
    </Box>
  );
}
