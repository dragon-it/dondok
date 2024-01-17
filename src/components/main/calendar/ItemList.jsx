import React, { useState, useEffect } from 'react';
import { List, Input, DatePicker, message, Popconfirm } from 'antd';
import DateTimeDisplay from './DateTimeDisplay';
import moment from 'moment';
import dummyData from '../../dummyData.json'
import CreateModal from './CreateModal';


const ItemList = ({ list, setList, listDetail }) => {
  if (list && list.length > 1) {
    list.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  }

  const [edit, setEdit] = useState(false);
  const [editableIndex, setEditableIndex] = useState(null);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [dateTime, setDateTime] = useState('');
  
 
  const editHandler = async (index, item) => {
    if (edit && editableIndex === index) {
      // 더미 데이터를 사용하여 수정 로직을 처리합니다.
      // 수정 로직 추가
      const updatedList = [...list];
      updatedList[index].amount = amount;
      updatedList[index].category = category;
      updatedList[index].date = moment(dateTime).add(9, 'hours').toISOString();
      
    
      setList(updatedList);
      setEditableIndex(null);
      console.log("Updated List:", updatedList);
    } else {
      setEditableIndex(index);
      setAmount(item.amount);
      setCategory(item.category);
      setDateTime(item.date);
    }
    setEdit(!edit);
  };

  useEffect(() => {
    console.log('List state has been updated:', list);
  }, [list]); // list 상태가 변경될 때마다 이 효과가 실행됩니다.
  
  
  const deleteHandler = async (index, id) => {
    const updatedList = [...list];
    const deletedItemIndex = updatedList.findIndex(item => item._id === id);
    if (deletedItemIndex !== -1) {
      updatedList.splice(deletedItemIndex, 1);
      setList(updatedList);
      message.success('삭제완료');
      console.log(updatedList)
    } else {
      message.error('삭제할 항목을 찾을 수 없습니다.');

    }
  };
  
  const updateCategoryHandler = (e, index) => {
    const { value } = e.target;
    const updatedList = [...list];
    updatedList[index].category = value;
    setList(updatedList);
    setCategory(value)
  };
  
  const amountChangeHandler = (e, index) => {
    const { value } = e.target;
    const number = value.match(/\d+/); // 숫자로만 이루어진 문자열을 추출
    const updatedList = [...list];
    updatedList[index].amount = Number(number);
    setList(updatedList);
    setAmount(Number(number) || 0); // amount 상태를 업데이트
  };
  const dateChangeHandler = (date) => {
    setDateTime(date.toISOString());
  };
  

  return (
    <>

      <List
        dataSource={listDetail}
        renderItem={(item, index) => (
          <List.Item
            key={item._id}
            actions={[
              <a
                key="list-loadmore-edit"
                onClick={() => editHandler(index, item)}
              >
                {edit && editableIndex === index ? '수정완료' : '수정'}
              </a>,
              <Popconfirm
                title="정말 삭제하시겠습니까?"
                onConfirm={() => deleteHandler(index, item._id)}
                okText="삭제"
                cancelText="취소"
                key="list-loadmore-more"
              >
                <a>삭제</a>
              </Popconfirm>,
            ]}
          >
<List.Item.Meta
  description={
    editableIndex === index && edit ? (
      <DatePicker
        placeholder={moment(item.date).format('YYYY-MM-DD HH:mm')}
        selected={moment(item.date)}
        format="YYYY-MM-DD HH:mm"
        showTime
        onChange={(date) => dateChangeHandler(date)}
      />
                ) : item.date ? (
                  <DateTimeDisplay dateTime={item.date} />
                ) : (
                  ''
                )
              }
              title={
                <Input
                  value={
                    editableIndex === index && category
                      ? category
                      : item.category
                  }
                  disabled={!(edit && editableIndex === index)}
                  defaultValue={item.category}
                  onChange={(e) => updateCategoryHandler(e, index)}
                />
              }
            />

            <div>
              <Input
                value={
                  editableIndex === index && amount
                    ? amount
                    : Number(item.amount).toLocaleString()
                }
                addonAfter="원"
                disabled={!(edit && editableIndex === index)}
                defaultValue={`${Number(item.amount).toLocaleString()}원`}
                onChange={(e) => amountChangeHandler(e, index)}
              />
            </div>
          </List.Item>
        )}
      />
      <CreateModal />
      
    </>
  );
};

export default ItemList;