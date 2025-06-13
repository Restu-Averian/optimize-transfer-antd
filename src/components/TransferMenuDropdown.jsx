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
  objSelectIdxRef,
  page,
  searchValue = "",
  selectLabel,
}) => {
  const titleDropdown = useMemo(() => {
    const dataSourceByDirectionLength =
      searchValue === ""
        ? dataSourceByDirection?.length
        : dataSourceByDirection?.filter((data) => {
            return data?.[selectLabel]
              ?.toString()
              ?.toLowerCase()
              ?.includes(searchValue);
          })?.length;

    const selectedLength = objLengthSelected?.[direction];

    const textItem = dataSourceByDirectionLength > 1 ? "items" : "item";

    if (selectedLength > 0) {
      return `${selectedLength}/${dataSourceByDirectionLength} ${textItem}`;
    }
    return `${dataSourceByDirectionLength} ${textItem}`;
  }, [dataSourceByDirection, objLengthSelected, direction, searchValue]);

  const isCheckedAllCurrent = useMemo(() => {
    return dataSourceByPage?.every((data) =>
      selectedKeyRef?.current?.has(data?.key)
    );
  }, [dataSourceByPage, selectedKeyRef, objLengthSelected, page]);

  const isCheckedAll = useMemo(() => {
    return dataSourceByDirection?.every((data) =>
      selectedKeyRef?.current?.has(data?.key)
    );
  }, [dataSourceByDirection, selectedKeyRef, objLengthSelected, page]);

  const menu = (
    <Menu>
      <Menu.Item
        key="select-all"
        onClick={() => {
          if (isCheckedAll) {
            selectedKeyRef?.current.clear();
          } else {
            dataSourceByDirection?.forEach((d) => {
              selectedKeyRef?.current.add(d.key);
            });
          }

          objSelectIdxRef.current[direction].start = -1;

          setObjLengthSelected((prev) => ({
            ...prev,
            [direction]: selectedKeyRef?.current?.size,
          }));
        }}
      >
        {isCheckedAll ? "Deselect All Data" : "Select All Data"}
      </Menu.Item>
      <Menu.Item
        key="select-current"
        onClick={() => {
          if (isCheckedAllCurrent) {
            dataSourceByPage?.forEach((d) => {
              selectedKeyRef?.current.delete(d.key);
            });
          } else {
            dataSourceByPage?.forEach((d) => {
              selectedKeyRef?.current.add(d.key);
            });
          }

          objSelectIdxRef.current[direction].start = -1;

          setObjLengthSelected((prev) => ({
            ...prev,
            [direction]: selectedKeyRef?.current?.size,
          }));
        }}
      >
        {isCheckedAllCurrent ? "Deselect Current Page" : " Select Current Page"}
      </Menu.Item>
    </Menu>
  );
  return (
    <Dropdown
      {...(dataSourceByPage?.length > 0
        ? {
            overlay: menu,
          }
        : {
            overlay: <div />,
          })}
      trigger={["click"]}
    >
      <a onClick={(e) => e?.preventDefault()}>
        <Space>
          {titleDropdown}

          {dataSourceByPage?.length > 0 ? <DownOutlined /> : null}
        </Space>
      </a>
    </Dropdown>
  );
};

const TransferMenuDropdown = memo(TransferMenuDropdown_);
export default TransferMenuDropdown;
