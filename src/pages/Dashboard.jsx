import Heading from "../components/Heading";
import Row from "../components/Row";
import {Button} from "../ui/button.tsx";

function Dashboard() {
  return (
    <>
      <Row>
        <Heading as="h1">Dashboard</Heading>
        <div>
          <Button variant="default">Arknights</Button>
        </div>
      </Row>
    </>
  );
}

export default Dashboard;
