import { Button, Form } from "antd";
import CustomTransfer from "./components/CustomTransfer";

const App = () => {
  const [form] = Form.useForm();
  return (
    <>
      <Form
        form={form}
        initialValues={{
          tes: ["content1", "content2", "content4"],
        }}
      >
        <CustomTransfer name="tes" selectValue="data" />
      </Form>

      <Button
        onClick={() => {
          form?.validateFields()?.then(() => {
            console.log("f ; ", form?.getFieldsValue(true));
          });
        }}
      >
        Check datas
      </Button>
    </>
  );
};
export default App;
