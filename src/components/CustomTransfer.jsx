import { Button, Form, Input } from "antd";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import TransferComp from "./TransferComp";
import TransferWrapperStyled from "../styled/TransferWrapper.styled";

const mockData = Array.from({
  length: 1000000,
  //   length: 30,
}).map((_, i) => ({
  //   key: i.toString(),
  data: `content${i + 1}`,
}));

const LIMIT = 10;

const CustomTransfer_ = ({ name, selectValue = "key" }) => {
  const formInstance = Form.useFormInstance();

  const [filterDatas, setFilterDatas] = useState([]);
  const [pageLeft, setPageLeft] = useState(1);
  const [pageRight, setPageRight] = useState(1);
  const [objLengthSelected, setObjLengthSelected] = useState({
    left: 0,
    right: 0,
  });

  const isInit = useRef(false);
  const oriDatasRef = useRef([]);
  const targetKeysRef = useRef([]);
  const selectedKeyLeftRef = useRef(new Set([]));
  const selectedKeyRightRef = useRef(new Set([]));

  const filterDatasRight = useMemo(() => {
    const targetKeysRefSet = new Set(targetKeysRef?.current);

    if (targetKeysRef?.current?.length > 10000) {
      return oriDatasRef.current?.filter((data) =>
        targetKeysRefSet?.has(data?.key)
      );
    } else {
      const datasRight = [];

      targetKeysRefSet?.forEach((targetKey) => {
        const objOriData = oriDatasRef.current.find(
          (oriData) => oriData?.key === targetKey
        );

        datasRight?.push(objOriData);
      });

      return datasRight;
    }
  }, [oriDatasRef.current, targetKeysRef?.current, filterDatas]);

  const titleDropdown = useCallback(
    (direction) => {
      const dataSourceLength =
        direction === "left" ? filterDatas?.length : filterDatasRight?.length;

      const textItem = dataSourceLength > 1 ? "items" : "item";

      if (objLengthSelected?.[direction] > 0) {
        return `${objLengthSelected?.[direction]}/${dataSourceLength} ${textItem}`;
      }
      return `${dataSourceLength} ${textItem}`;
    },
    [filterDatas, objLengthSelected, filterDatasRight]
  );

  const filterByPage = useCallback(
    ({ direction, arrDatas }) => {
      const page = direction === "left" ? pageLeft : pageRight;

      const start = (page - 1) * 10;
      const end = page * LIMIT;

      return arrDatas?.slice(start, end);
    },
    [pageLeft, pageRight]
  );

  const onFakeFetch = () => {
    return new Promise((resolve) => {
      // setTimeout(() => {
      //   resolve(mockData);
      // }, 1000);

      resolve(mockData);
    });
  };

  const fetchDatasource = async () => {
    try {
      const data = await onFakeFetch();

      const dataResult = data?.map((item, i) => ({
        ...item,
        key: i?.toString(),
      }));

      oriDatasRef.current = dataResult;

      const formValue = formInstance?.getFieldValue(name) ?? [];

      const targetDatas = dataResult?.filter((item) =>
        formValue?.includes(item?.[selectValue])
      );

      const initFilterData = dataResult?.filter(
        (item) => !formValue?.includes(item?.[selectValue])
      );

      targetKeysRef.current = targetDatas?.map((item) => item?.key);

      setFilterDatas(initFilterData);
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
      const updtdFilterDatas = filterDatas?.filter((data) => {
        return !selectedKeyLeftRef.current?.has(data?.key);
      });

      const newTargetKeys = [];

      selectedKeyLeftRef.current.forEach((key) => {
        newTargetKeys.push(key);
      });

      targetKeysRef.current.forEach((key) => {
        newTargetKeys.push(key);
      });

      targetKeysRef.current = newTargetKeys;

      setFilterDatas(updtdFilterDatas);

      setTimeout(() => {
        selectedKeyLeftRef?.current?.clear();

        setObjLengthSelected((prev) => ({
          ...prev,
          left: 0,
        }));
      }, 0);
    } else {
      const targetKeysRefSet = new Set(targetKeysRef?.current);

      const newFilterDatas = filterDatasRight?.filter((data) =>
        targetKeysRefSet?.has(data?.key)
      );

      selectedKeyRightRef?.current?.forEach((key) => {
        targetKeysRefSet?.delete(key);
      });

      targetKeysRef.current = Array.from(targetKeysRefSet);

      setFilterDatas([...newFilterDatas, ...filterDatas]);

      setTimeout(() => {
        selectedKeyRightRef?.current?.clear();

        setObjLengthSelected((prev) => ({
          ...prev,
          right: 0,
        }));
      }, 0);
    }
  };

  useEffect(() => {
    fetchDatasource();
  }, []);

  useEffect(() => {
    console.log("f;  ", filterDatasRight);

    if (isInit.current) {
      formInstance?.setFieldsValue({
        [name]: filterDatasRight?.map((data) => data?.[selectValue]),
      });
    }
  }, [filterDatasRight]);

  return (
    <TransferWrapperStyled>
      <Form.Item name={name} hidden>
        <Input />
      </Form.Item>

      <TransferComp
        dataSource={filterByPage({
          arrDatas: filterDatas,
          direction: "left",
        })}
        datasLength={filterDatas?.length}
        oriDatasRef={oriDatasRef}
        page={pageLeft}
        setPage={setPageLeft}
        selectedKeyRef={selectedKeyLeftRef}
        titleDropdown={titleDropdown("left")}
        setObjLengthSelected={setObjLengthSelected}
        direction="left"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Button
          icon={<RightOutlined />}
          onClick={() => {
            onUpdate({
              from: "left",
            });
          }}
        />
        <Button
          icon={<LeftOutlined />}
          onClick={() => {
            onUpdate({
              from: "right",
            });
          }}
        />
      </div>

      <TransferComp
        dataSource={filterByPage({
          arrDatas: filterDatasRight,
          direction: "right",
        })}
        datasLength={filterDatasRight?.length}
        oriDatasRef={oriDatasRef}
        page={pageRight}
        setPage={setPageRight}
        selectedKeyRef={selectedKeyRightRef}
        setObjLengthSelected={setObjLengthSelected}
        titleDropdown={titleDropdown("right")}
        direction="right"
      />
    </TransferWrapperStyled>
  );
};

const CustomTransfer = memo(CustomTransfer_);
export default CustomTransfer;
