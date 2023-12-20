import { extendTheme } from '@chakra-ui/react';

const globalStyles = extendTheme({
  styles: {
    global: {
      // styles for the `body`
      body: {
        bgColor: 'black',
        fontSize: '10px', //你可以更改为你所需要的字体大小
      },
    },
  },
});

export default globalStyles;
