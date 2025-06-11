import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Menu, Space } from "antd";
import { memo, useMemo } from "react";

const TransferMenuDropdown_ = ({
  selectedKeyRef,
  dataSourceByPage,
  objLengthSelected,
  setObjLengthSelected,
  direction,
  dataSourceByDirection = [],
  startIdxRef,
}) => {
  const titleDropdown = useMemo(() => {
    const selectedLength = objLengthSelected?.[direction];

    const textItem = dataSourceByDirection?.length > 1 ? "items" : "item";

    if (selectedLength > 0) {
      return `${selectedLength}/${dataSourceByDirection?.length} ${textItem}`;
    }
    return `${dataSourceByDirection?.length} ${textItem}`;
  }, [dataSourceByDirection, objLengthSelected, direction]);

  const menu = (
    <Menu>
      <Menu.Item
        key="select-all"
        onClick={() => {
          const isCheckedAll = dataSourceByDirection?.every((data) =>
            selectedKeyRef?.current?.has(data?.key)
          );

          if (isCheckedAll) {
            selectedKeyRef?.current.clear();
          } else {
            dataSourceByDirection?.forEach((d) => {
              selectedKeyRef?.current.add(d.key);
            });
          }

          startIdxRef.current = -1;

          setObjLengthSelected((prev) => ({
            ...prev,
            [direction]: selectedKeyRef?.current?.size,
          }));
        }}
      >
        Select All Data
      </Menu.Item>
      <Menu.Item
        key="select-current"
        onClick={() => {
          const isCheckedAllCurrent = dataSourceByPage?.every((data) =>
            selectedKeyRef?.current?.has(data?.key)
          );

          if (isCheckedAllCurrent) {
            dataSourceByPage?.forEach((d) => {
              selectedKeyRef?.current.delete(d.key);
            });
          } else {
            dataSourceByPage?.forEach((d) => {
              selectedKeyRef?.current.add(d.key);
            });
          }

          startIdxRef.current = -1;

          setObjLengthSelected((prev) => ({
            ...prev,
            [direction]: selectedKeyRef?.current?.size,
          }));
        }}
      >
        Select Current Page
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} trigger={["click"]}>
      <a onClick={(e) => e?.preventDefault()}>
        <Space>
          {titleDropdown}
          <DownOutlined />
        </Space>
      </a>
    </Dropdown>
  );
};

const TransferMenuDropdown = memo(TransferMenuDropdown_);
export default TransferMenuDropdown;
