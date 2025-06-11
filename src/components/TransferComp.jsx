import { memo, useMemo, useRef } from "react";
import Footer from "../Footer";
import { Checkbox, Table, Transfer, Typography } from "antd";
import TransferMenuDropdown from "./TransferMenuDropdown";

const { Text } = Typography;
const LIMIT = 10;

const TransferComp_ = ({
  dataSource,
  selectedKeyRef,
  datasLength,
  page,
  setPage,
  titleDropdown,
  setObjLengthSelected,
  direction,
}) => {
  const startIdxRef = useRef(-1);
  const endIdxRef = useRef(-1);

  const filterDatas = useMemo(() => {
    const start = (page - 1) * 10;
    const end = page * LIMIT;

    return dataSource?.slice(start, end);
  }, [page, dataSource]);

  const onMultipleSelect = (key) => {
    if (key < startIdxRef?.current) {
      endIdxRef.current = startIdxRef?.current;

      startIdxRef.current = key;
    } else {
      endIdxRef.current = key;
    }

    const selectedDatas = dataSource?.filter(
      (data) =>
        startIdxRef?.current <= data?.key && endIdxRef?.current >= data?.key
    );

    if (
      selectedDatas?.every((data) => selectedKeyRef?.current?.has(data?.key))
    ) {
      selectedDatas?.forEach((data) => {
        selectedKeyRef?.current.delete(data?.key);
      });
    } else {
      selectedDatas?.forEach((data) => {
        selectedKeyRef?.current.add(data?.key);
      });
    }

    startIdxRef.current = key;
  };

  const onOnceSelect = (key) => {
    if (selectedKeyRef?.current?.has(key)) {
      selectedKeyRef?.current.delete(key);
      startIdxRef.current = -1;
    } else {
      selectedKeyRef?.current.add(key);

      startIdxRef.current = key;
    }
  };

  return (
    <Transfer
      showSearch
      filterOption={(inputValue, option) =>
        option.data.indexOf(inputValue) > -1
      }
      dataSource={filterDatas}
      showSelectAll={false}
      selectAllLabels={[
        <TransferMenuDropdown
          titleDropdown={titleDropdown}
          dataSource={filterDatas}
          dataSourceByDirection={dataSource}
          selectedKeyRef={selectedKeyRef}
          setObjLengthSelected={setObjLengthSelected}
          direction={direction}
          startIdxRef={startIdxRef}
        />,
      ]}
      footer={() => (
        <Footer page={page} setPage={setPage} datasLength={datasLength} />
      )}
    >
      {({ filteredItems }) => {
        return (
          <Table
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
                onClick: (e) => {
                  if (e?.shiftKey && startIdxRef?.current !== -1) {
                    onMultipleSelect(key);
                  } else {
                    onOnceSelect(key);
                  }

                  setObjLengthSelected((prev) => ({
                    ...prev,
                    [direction]: selectedKeyRef.current.size,
                  }));
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
