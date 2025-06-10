import { memo, useState } from "react";
import Footer from "../Footer";
import { Checkbox, Table, Transfer, Typography } from "antd";
import TransferMenuDropdown from "./TransferMenuDropdown";

const { Text } = Typography;

const TransferComp_ = ({
  dataSource,
  oriDatasRef,
  selectedKeyRef,
  datasLength,
  page,
  setPage,
  titleDropdown,
  setObjLengthSelected,
  direction,
}) => {
  const [triggerRender, setTriggerRender] = useState(0);

  return (
    <Transfer
      showSearch
      filterOption={(inputValue, option) =>
        option.data.indexOf(inputValue) > -1
      }
      dataSource={dataSource}
      showSelectAll={false}
      selectAllLabels={[
        <TransferMenuDropdown
          titleDropdown={titleDropdown}
          dataSource={dataSource}
          oriDatasRef={oriDatasRef}
          selectedKeyRef={selectedKeyRef}
          setTriggerRender={setTriggerRender}
          setObjLengthSelected={setObjLengthSelected}
          direction={direction}
        />,
      ]}
      footer={() => (
        <Footer page={page} setPage={setPage} datasLength={datasLength} />
      )}
    >
      {({ filteredItems }) => {
        return (
          <Table
            key={triggerRender}
            dataSource={filteredItems}
            showHeader={false}
            columns={[
              {
                key: "selected",
                dataIndex: "selected",
                render: (_, record) => {
                  return (
                    <Checkbox
                      checked={selectedKeyRef?.current?.has(record?.key)}
                    />
                  );
                },
                width: 5,
              },
              {
                key: "data",
                dataIndex: "data",
                render: (_, record) => {
                  return (
                    <div>
                      <Text>{record?.data}</Text>
                    </div>
                  );
                },
              },
            ]}
            onRow={({ key }) => {
              return {
                onClick: () => {
                  if (selectedKeyRef?.current?.has(key)) {
                    selectedKeyRef?.current.delete(key);
                  } else {
                    selectedKeyRef?.current.add(key);
                  }

                  setObjLengthSelected((prev) => ({
                    ...prev,
                    [direction]: selectedKeyRef.current.size,
                  }));

                  setTriggerRender((prev) => prev + 1);
                },
              };
            }}
            pagination={false}
          />
        );
      }}
    </Transfer>
  );
};

const TransferComp = memo(TransferComp_);
export default TransferComp;
