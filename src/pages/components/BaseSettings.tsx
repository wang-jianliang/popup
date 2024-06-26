// The below import defines which components come from formik
// import { Field, Form, Formik } from 'formik';

import { useFormik } from 'formik';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  VStack,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  ACCESS_CODE_PREFIX,
  API_KEY_PREFIX,
  GLOBAL_CONFIG_KEY_ACTIVATION_DATA,
  GLOBAL_CONFIG_KEY_ENGINE_SETTINGS,
  LICENSE_KEY_PREFIX,
} from '@src/constants';
import EngineSettings from '@src/engines/engineSettings';
import { getGlobalConfig, saveGlobalConfig } from '@pages/content/storageUtils';
import { type ActivateLicense, activateLicense } from '@lemonsqueezy/lemonsqueezy.js';
import { getDeviceId } from '@src/utils';
import { ExternalLinkIcon } from '@chakra-ui/icons';

interface FormValues {
  apiKey: string;
}

function isLicenseKey(key: string) {
  const regex = /^[A-Z0-9]{8}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{12}$/;
  if (key.startsWith(LICENSE_KEY_PREFIX)) {
    key = key.slice(3);
  }
  return regex.test(key);
}

export default function BaseSettings() {
  const [settings, setSettings] = useState<EngineSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [showLicenseKey, setShowLicenseKey] = useState(false);

  const validate = (values: FormValues) => {
    const errors: Partial<FormValues> = {};
    const apiKey = values.apiKey;
    if (!apiKey) {
      errors.apiKey = 'A valid license key is required';
    } else if (
      !apiKey.startsWith(API_KEY_PREFIX) &&
      !apiKey.startsWith(ACCESS_CODE_PREFIX) &&
      !apiKey.startsWith(LICENSE_KEY_PREFIX) &&
      !isLicenseKey(apiKey)
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

      let apiKey = values.apiKey;
      // If the API key starts with "ak-", perform an activation
      if (isLicenseKey(apiKey)) {
        // Perform activation
        const licenseKey = values.apiKey.startsWith(LICENSE_KEY_PREFIX) ? values.apiKey.slice(3) : values.apiKey;
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
        await saveGlobalConfig(GLOBAL_CONFIG_KEY_ACTIVATION_DATA, activationData);
        if (!apiKey.startsWith(LICENSE_KEY_PREFIX)) {
          apiKey = `${LICENSE_KEY_PREFIX}${apiKey}`;
        }
        console.log('new activation');
      }

      const newSettings = { ...settings, apiKey: apiKey };
      setSettings(newSettings);
      await saveGlobalConfig(GLOBAL_CONFIG_KEY_ENGINE_SETTINGS, newSettings)
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
    getGlobalConfig(GLOBAL_CONFIG_KEY_ENGINE_SETTINGS).then((settings: EngineSettings) => {
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
            <InputGroup>
              <Input
                {...formik.getFieldProps('apiKey')}
                onBlur={e => {
                  setSaved(false);
                  formik.handleBlur(e);
                }}
                placeholder="Please input your API key or license key"
                type={showLicenseKey ? 'text' : 'password'}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => setShowLicenseKey(!showLicenseKey)}>
                  {showLicenseKey ? 'Hide' : 'Show'}
                </Button>
              </InputRightElement>
            </InputGroup>
            <Link
              color="blue.400"
              href="https://store.hellogeek.work/checkout/buy/d65c00fe-29fc-4872-879a-bd424d437150"
              isExternal>
              Get a license key <ExternalLinkIcon mx="2px" />
            </Link>
            <FormErrorMessage>{formik.errors.apiKey}</FormErrorMessage>
          </FormControl>
        </VStack>
        <Button
          marginTop={4}
          size="md"
          colorScheme="blue"
          isLoading={formik.isSubmitting}
          isDisabled={saved}
          type="submit">
          Save
        </Button>
      </form>
      <Box marginTop={5}>
        {(!settings || !settings.apiKey) && (
          <Alert status="error" borderRadius={5}>
            <AlertIcon />
            License key is not set. Please set your license key in the settings.
          </Alert>
        )}
      </Box>
    </Box>
  );
}
