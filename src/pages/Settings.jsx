import Heading from "../components/Heading";
import Row from "../components/Row";

import { UpdateSettingsForm } from "@/features/settings/UpdateSettingsForm";

function Settings() {
  return (
    <>
      <Row>
        <Heading as="h1">Settings</Heading>
        <UpdateSettingsForm></UpdateSettingsForm>
      </Row>
    </>
  );
}

export default Settings;
