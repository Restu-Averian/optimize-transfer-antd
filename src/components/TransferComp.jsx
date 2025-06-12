import { memo, useMemo } from "react";
import Footer from "../Footer";
import { Checkbox, Table, Transfer, Typography } from "antd";
import TransferMenuDropdown from "./TransferMenuDropdown";

const { Text } = Typography;
const LIMIT = 10;

const TransferComp_ = ({
  dataSource,
  page,
  setPage,
  selectedKeyRef,
  objLengthSelected,
  setObjLengthSelected,
  direction,
  objSelectIdxRef,
}) => {
  // const startIdxRef = useRef(-1);
  // const endIdxRef = useRef(-1);

  const filterDatas = useMemo(() => {
    const start = (page - 1) * 10;
    const end = page * LIMIT;

    return dataSource?.slice(start, end);
  }, [page, dataSource]);

  const onMultipleSelect = ({ selectKey }) => {
    if (selectKey < objSelectIdxRef?.current?.[direction]?.start) {
      objSelectIdxRef.current[direction].end =
        objSelectIdxRef?.current?.[direction]?.start;

      objSelectIdxRef.current[direction].start = selectKey;
    } else {
      objSelectIdxRef.current[direction].end = selectKey;
    }

    const selectedDatas = dataSource?.filter(
      (data) =>
        objSelectIdxRef?.current?.[direction]?.start <= data?.selectKey &&
        objSelectIdxRef?.current?.[direction]?.end >= data?.selectKey
    );

    if (
      selectedDatas?.every((data) =>
        selectedKeyRef?.current?.has(data?.selectKey)
      )
    ) {
      selectedDatas?.forEach((data) => {
        selectedKeyRef?.current.delete(data?.key);
      });
    } else {
      selectedDatas?.forEach((data) => {
        selectedKeyRef?.current.add(data?.key);
      });
    }

    objSelectIdxRef.current[direction].start = selectKey;
  };

  const onOnceSelect = ({ key, selectKey }) => {
    if (selectedKeyRef?.current?.has(key)) {
      selectedKeyRef?.current.delete(key);

      objSelectIdxRef.current[direction].start = -1;
    } else {
      selectedKeyRef?.current.add(key);

      objSelectIdxRef.current[direction].start = selectKey;
    }
  };

  return (
    <Transfer
      showSearch
      filterOption={(inputValue, option) =>
        option.data.indexOf(inputValue) > -1
      }
      // dataSource={filterDatas}
      showSelectAll={false}
      selectAllLabels={[
        <TransferMenuDropdown
          dataSourceByPage={filterDatas}
          dataSourceByDirection={dataSource}
          selectedKeyRef={selectedKeyRef}
          objLengthSelected={objLengthSelected}
          setObjLengthSelected={setObjLengthSelected}
          direction={direction}
          objSelectIdxRef={objSelectIdxRef}
          key="transfer-dropdowns"
        />,
      ]}
      footer={() => (
        <Footer
          page={page}
          setPage={setPage}
          datasLength={dataSource?.length}
        />
      )}
    >
      {() => {
        return (
          <Table
            // dataSource={filteredItems}
            dataSource={filterDatas}
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
            onRow={({ key, selectKey }) => {
              return {
                onClick: (e) => {
                  if (
                    e?.shiftKey &&
                    objSelectIdxRef?.current?.[direction]?.start !== -1
                  ) {
                    onMultipleSelect({ selectKey });
                  } else {
                    onOnceSelect({ key, selectKey });
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
