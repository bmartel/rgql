import NextDocument, { Html, Head, Main, NextScript, DocumentInitialProps } from 'next/document'
import { getCssText } from '../stitches.config'

export default class Document extends NextDocument {
  // eslint-disable-next-line
  static async getInitialProps(ctx: any): Promise<DocumentInitialProps> {
    try {
      const initialProps = await NextDocument.getInitialProps(ctx)

      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {/* Stitches CSS for SSR */}
            <style id="stitches" dangerouslySetInnerHTML={{ __html: getCssText() }} />
          </>
        ),
      }
    } finally {
    }
  }

  // eslint-disable-next-line
  render(): any {
    return (
      <Html lang="en">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
