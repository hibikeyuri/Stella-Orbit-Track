import Heading from "../components/Heading";

import SignupForm from "@/features/authentication/SignupForm";

function NewUsers() {
  return (
    <>
      <Heading as="h1">Create a new User</Heading>
      <SignupForm></SignupForm>
    </>
  );
}

export default NewUsers;
