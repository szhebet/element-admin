
import {
  AdminIcon,
  ExportArchiveIcon,
} from "@vector-im/compound-design-tokens/assets/web/icons";
import { Button } from "@vector-im/compound-web";
import { FormattedMessage } from "react-intl";

import * as Card from "@/components/card";
import { ProBadge } from "@/components/logo";

export const AlsoAvailableInPro = () => (
  <Card.Root kind="primary" narrow>
    <Card.Header>
      <Card.Title>

      </Card.Title>
      <ProBadge />
    </Card.Header>

    <Card.Body>

    </Card.Body>

    <Card.Footer>
      <Button
        as="a"
        target="_blank"
        href=""
        kind="primary"
        size="sm"
      >

      </Button>
    </Card.Footer>
  </Card.Root>
);

export const SupervisionCard = ({ proBadge }: { proBadge?: boolean }) => (
  <Card.Root kind="secondary">
    <Card.Header>
      <Card.Icon icon={AdminIcon} />
      <Card.Title>
        <FormattedMessage
          id="marketing.supervision.title"
          defaultMessage="Supervision"
          description="Title of the card explaining what supervision is"
        />
      </Card.Title>
      {proBadge && <ProBadge />}
    </Card.Header>

    <FormattedMessage
      id="marketing.supervision.description"
      defaultMessage=""
      values={{
        p: (chunks) => <Card.Body>{...chunks}</Card.Body>,
        ul: (chunks) => <Card.Checklist>{...chunks}</Card.Checklist>,
        li: (chunks) => <Card.ChecklistItem>{...chunks}</Card.ChecklistItem>,
      }}
      description="Description of the card explaining what supervision is"
    />
  </Card.Root>
);

export const AuditingCard = ({ proBadge }: { proBadge?: boolean }) => (
  <Card.Root kind="secondary">
    <Card.Header>
      <Card.Icon icon={ExportArchiveIcon} />
      <Card.Title>
        <FormattedMessage
          id="marketing.auditing.title"
          defaultMessage="Auditing"
          description="Title of the card explaining what auditing is"
        />
      </Card.Title>
      {proBadge && <ProBadge />}
    </Card.Header>

    <Card.Body>
      <FormattedMessage
        id="marketing.auditing.description"
        defaultMessage=""
        values={{
          p: (chunks) => <p>{...chunks}</p>,
        }}
        description="Description of the card explaining what auditing is"
      />
    </Card.Body>
  </Card.Root>
);
