import { Source_Code_Pro } from "next/font/google";
import "./globals.css";

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export const metadata = {
  title: "IntelliForm",
  description: "Created by Md. Fahad Uddin.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${sourceCodePro.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
