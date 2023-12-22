import { BsSend } from 'react-icons/bs';
import { AiOutlineClear } from 'react-icons/ai';
import { Box } from '@chakra-ui/react';

export function Send() {
  return <Box as={BsSend} backgroundColor="transparent" color="blue.200" />;
}

export function Clear() {
  return <Box as={AiOutlineClear} backgroundColor="transparent" color="blue.200" />;
}
