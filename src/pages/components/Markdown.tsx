import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import rangeParser from 'parse-numeric-range';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import Markdown from 'react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import { Box } from '@chakra-ui/react';

type MarkdownProps = {
  markdown: string & { content?: string };
};

const MarkdownSyntaxHighlight = ({ markdown }: MarkdownProps) => {
  const syntaxTheme = oneDark;

  const markdownComponents: object = {
    code: function ({ node, className, ...props }) {
      const hasLang = /language-(\w+)/.exec(className || '');
      const hasMeta = node?.data?.meta;

      const applyHighlights: object = (applyHighlights: number) => {
        if (hasMeta) {
          const RE = /{([\d,-]+)}/;
          const metadata = node.data.meta?.replace(/\s/g, '');
          const lineNumbers = RE?.test(metadata) ? RE?.exec(metadata)[1] : '0';
          const highlight = rangeParser(lineNumbers);
          const data: string = highlight.includes(applyHighlights) ? 'highlight' : null;
          return { data };
        } else {
          return {};
        }
      };

      return hasLang ? (
        <SyntaxHighlighter
          style={syntaxTheme}
          language={hasLang[1]}
          PreTag="div"
          className="codeStyle"
          showLineNumbers={true}
          wrapLines={hasMeta}
          useInlineStyles={true}
          lineProps={applyHighlights}>
          {/* eslint-disable-next-line react/prop-types */}
          {props.children}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props} />
      );
    },
  };

  const newTheme = {
    p: (props: any) => {
      const { children } = props;
      return (
        <Box fontSize="14px" fontWeight="normal">
          {children}
        </Box>
      );
    },
    ...markdownComponents,
  };
  return <Markdown components={ChakraUIRenderer(newTheme)}>{markdown}</Markdown>;
};

export default MarkdownSyntaxHighlight;
