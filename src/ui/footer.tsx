
import { Link } from "@vector-im/compound-web";
import { FormattedMessage } from "react-intl";

import * as Footer from "@/components/footer";
import { LanguageSwitcher } from "@/ui/language-switcher";

const AppFooter = () => (
  <Footer.Root>
    <Footer.ElementLogo />

    <Footer.Section>

      <Footer.Divider />

      <Footer.Divider />

    </Footer.Section>

    <Footer.Divider />

    <Footer.Section>
      <Footer.CopyrightNotice />
      <Footer.Divider />
      <LanguageSwitcher />
    </Footer.Section>
  </Footer.Root>
);

export default AppFooter;
