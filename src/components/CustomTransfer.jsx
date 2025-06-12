import { Checkbox, Form, Table, Transfer, Typography } from "antd";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generateSelectKey } from "../helpers";
import TransferMenuDropdown from "./TransferMenuDropdown";
import Footer from "../Footer";

const mockData = Array.from({
  length: 1000000,
  // length: 300000,
  // length: 50000,
  // length: 30,
}).map((_, i) => ({
  //   key: i.toString(),
  // data: `content${i + 1}`,
  data: `content${i}`,
}));

const { Text } = Typography;

const CustomTransfer_ = ({
  name,
  selectValue = "key",
  selectLabel = "data",
}) => {
  const formInstance = Form.useFormInstance();

  const [pageLeft, setPageLeft] = useState(1);
  const [pageRight, setPageRight] = useState(1);
  const [objLengthSelected, setObjLengthSelected] = useState({
    left: 0,
    right: 0,
  });
  const [isAllEmp, setAllEmp] = useState(false);

  const isInit = useRef(false);
  const oriDatasRef = useRef([]);
  const filterDatasRef = useRef([]);
  const targetKeysRef = useRef([]);
  const selectedKeyLeftRef = useRef(new Set([]));
  const selectedKeyRightRef = useRef(new Set([]));
  const objSelectIdxRef = useRef({
    left: {
      start: -1,
      end: -1,
    },
    right: {
      start: -1,
      end: -1,
    },
  });

  const filterDatasRight = useMemo(() => {
    const targetKeysRefSet = new Set(targetKeysRef?.current);

    if (targetKeysRef?.current?.length > 10000) {
      const datasRight = oriDatasRef.current?.filter((data) =>
        targetKeysRefSet?.has(data?.key)
      );

      return generateSelectKey(datasRight);
    } else {
      const datasRight = [];

      targetKeysRefSet?.forEach((targetKey) => {
        const objOriData = oriDatasRef.current.find(
          (oriData) => oriData?.key === targetKey
        );

        datasRight?.push(objOriData);
      });

      return generateSelectKey(datasRight);
    }
  }, [oriDatasRef.current, targetKeysRef?.current, filterDatasRef?.current]);

  const onFakeFetch = () => {
    return new Promise((resolve) => {
      resolve(mockData);
    });
  };

  const fetchDatasource = async () => {
    try {
      const data = await onFakeFetch();

      const dataResult = generateSelectKey(
        data?.map((item, i) => ({
          ...item,
          data: item?.[selectLabel],
          key: i,
        }))
      );

      oriDatasRef.current = dataResult;

      const formValue = formInstance?.getFieldValue(name) ?? [];

      const targetDatas = dataResult?.filter((item) =>
        formValue?.includes(item?.[selectValue])
      );

      const initFilterData = dataResult?.filter(
        (item) => !formValue?.includes(item?.[selectValue])
      );

      targetKeysRef.current = targetDatas?.map((item) => item?.key);

      filterDatasRef.current = initFilterData;

      setObjLengthSelected({
        left: 0,
        right: 0,
      });
    } catch (err) {
      console.log("er;  ", err);
    } finally {
      isInit.current = true;
    }
  };

  /**
   *
   * @param {object} props
   * @param {'left' | 'right'} props.from
   */
  const onUpdate = ({ from }) => {
    if (from === "left") {
      const updtdFilterDatas = filterDatasRef?.current?.filter((data) => {
        return !selectedKeyLeftRef.current?.has(data?.key);
      });

      const newTargetKeys = [];

      selectedKeyLeftRef.current.forEach((key) => {
        newTargetKeys.push(key);
      });

      targetKeysRef?.current.forEach((key) => {
        newTargetKeys.push(key);
      });

      targetKeysRef.current = newTargetKeys;

      filterDatasRef.current = generateSelectKey(updtdFilterDatas);

      setObjLengthSelected((prev) => ({
        ...prev,
        left: 0,
      }));

      selectedKeyLeftRef?.current?.clear();
    } else {
      const targetKeysRefSet = new Set(targetKeysRef?.current);

      const newFilterDatas = filterDatasRight?.filter((data) =>
        selectedKeyRightRef?.current?.has(data?.key)
      );

      selectedKeyRightRef?.current?.forEach((key) => {
        targetKeysRefSet?.delete(key);
      });

      targetKeysRef.current = Array.from(targetKeysRefSet);

      filterDatasRef.current = generateSelectKey([
        ...newFilterDatas,
        ...filterDatasRef.current,
      ]);

      setObjLengthSelected((prev) => ({
        ...prev,
        right: 0,
      }));

      selectedKeyRightRef?.current?.clear();
    }

    objSelectIdxRef.current[from] = {
      start: -1,
      end: -1,
    };
  };

  const onFilterDatas = useCallback(
    ({ direction }) => {
      const page = direction === "left" ? pageLeft : pageRight;
      const dataSource =
        direction === "left" ? filterDatasRef?.current : filterDatasRight;

      const start = (page - 1) * 10;
      const end = page * 10;

      return dataSource?.slice(start, end);
    },
    [pageLeft, pageRight, filterDatasRef?.current, filterDatasRight]
  );

  const onMultipleSelect = ({
    selectKey,
    dataSource,
    selectedKeyRef,
    direction,
  }) => {
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

    objSelectIdxRef.current[direction].start = -1;
  };

  const onOnceSelect = ({ key, selectKey, selectedKeyRef, direction }) => {
    if (selectedKeyRef?.current?.has(key)) {
      selectedKeyRef?.current.delete(key);

      objSelectIdxRef.current[direction].start = -1;
    } else {
      selectedKeyRef?.current.add(key);

      objSelectIdxRef.current[direction].start = selectKey;
    }
  };

  useEffect(() => {
    fetchDatasource();
  }, []);

  useEffect(() => {
    if (isInit.current) {
      formInstance?.setFieldsValue({
        [name]: filterDatasRight?.map((data) => data?.[selectValue]),
      });
    }
  }, [filterDatasRight]);

  return (
    <Form.Item label="Restu" name={name} rules={[{ required: true }]}>
      <Checkbox
        onChange={({ target: { checked } }) => {
          setAllEmp(checked);

          const isAllTargetted =
            targetKeysRef?.current?.length === oriDatasRef?.current?.length;

          if (checked && !isAllTargetted) {
            const allKeyOriDatas = oriDatasRef.current?.map(
              (data) => data?.key
            );

            selectedKeyLeftRef.current = new Set(allKeyOriDatas);

            onUpdate({ from: "left" });

            setObjLengthSelected((prev) => ({
              ...prev,
              right: oriDatasRef?.current?.length,
            }));
          }
        }}
      >
        All Employee
      </Checkbox>

      {isAllEmp ? null : (
        <Transfer
          selectedKeys={[
            ...Array.from(selectedKeyLeftRef.current).slice(0, 1),
            ...Array.from(selectedKeyRightRef.current).slice(0, 1),
          ]}
          targetKeys={targetKeysRef.current}
          showSearch
          filterOption={(inputValue, option) =>
            option.data.indexOf(inputValue) > -1
          }
          showSelectAll={false}
          selectAllLabels={[
            <TransferMenuDropdown
              dataSourceByPage={onFilterDatas({ direction: "left" })}
              dataSourceByDirection={filterDatasRef?.current}
              selectedKeyRef={selectedKeyLeftRef}
              objLengthSelected={objLengthSelected}
              setObjLengthSelected={setObjLengthSelected}
              direction={"left"}
              objSelectIdxRef={objSelectIdxRef}
              key="transfer-dropdown-left"
              page={pageLeft}
            />,
            <TransferMenuDropdown
              dataSourceByPage={onFilterDatas({ direction: "right" })}
              dataSourceByDirection={filterDatasRight}
              selectedKeyRef={selectedKeyRightRef}
              objLengthSelected={objLengthSelected}
              setObjLengthSelected={setObjLengthSelected}
              direction={"right"}
              objSelectIdxRef={objSelectIdxRef}
              key="transfer-dropdown-right"
              page={pageRight}
            />,
          ]}
          footer={(_, { direction }) => {
            if (direction === "left") {
              return (
                <Footer
                  page={pageLeft}
                  setPage={setPageLeft}
                  datasLength={filterDatasRef?.current?.length}
                />
              );
            }
            return (
              <Footer
                page={pageRight}
                setPage={setPageRight}
                datasLength={filterDatasRight?.length}
              />
            );
          }}
          onChange={(_, destDirection) => {
            onUpdate({ from: destDirection === "right" ? "left" : "right" });
          }}
        >
          {({ direction }) => {
            const dataSource =
              direction === "left" ? filterDatasRef.current : filterDatasRight;

            const selectedKeyRef =
              direction === "left" ? selectedKeyLeftRef : selectedKeyRightRef;

            return (
              <Table
                // dataSource={dataSource}
                dataSource={onFilterDatas({ direction })}
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
                        onMultipleSelect({
                          selectKey,
                          dataSource,
                          selectedKeyRef,
                          direction,
                        });
                      } else {
                        onOnceSelect({
                          key,
                          selectKey,
                          selectedKeyRef,
                          direction,
                        });
                      }

                      setObjLengthSelected((prev) => ({
                        ...prev,
                        [direction]: selectedKeyRef?.current?.size,
                      }));
                    },
                  };
                }}
                pagination={false}
              />
            );
          }}
        </Transfer>
      )}
    </Form.Item>
  );
};

const CustomTransfer = memo(CustomTransfer_);
export default CustomTransfer;
