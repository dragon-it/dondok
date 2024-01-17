import React, { useState } from 'react';
import { Button, Modal, Input, DatePicker } from 'antd';
import moment from 'moment';

const CreateModal = (props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState(0);
  const [dateTime, setDateTime] = useState(moment().add(9, 'hours').toISOString());

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      // API 호출 부분 대신에 더미 데이터 처리
      setIsModalOpen(false);
      
      // 새로운 항목 추가 후, 새로운 list를 생성
      const newItem = {
        _id: 2,
        category,
        amount,
        date: dateTime,
      };

      const updatedList = [...props.list, newItem]; // 기존 list에 새로운 항목 추가

      // props.itemChangedHandler 호출 시, 새로운 list를 함께 전달
      props.itemChangedHandler(updatedList);
      console.log(newItem)

      // 기존의 state들 초기화
      setDateTime(moment().add(9, 'hours').toISOString());
      setCategory('');
      setAmount('');
    } catch (e) {
      // 오류 처리
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setCategory('');
    setAmount('');
  };

  const dateChangeHandler = (date) => {
    setDateTime(date.add(9, 'hour').toISOString());
  };

  const categoryChangeHandler = (e) => {
    setCategory(e.target.value);
  };

  const amountChangeHandler = (e) => {
    const { value } = e.target;
    const number = value.replace(/[^0-9]/g, '');
    const formattedNumber = Number(number).toLocaleString();
    setAmount(formattedNumber);
  };

  return (
    <>
      <div style={{
        position: 'relative',
        width: '100%',
        margin: '0 auto',
        height: 'auto',
      }}>
        <Button
          onClick={showModal}
          style={{
            position: 'fixed',
            bottom: 'calc(9%)',
            right: 'calc(50% - 180px)',
            backgroundColor: 'rgb(200, 244, 255)',
            borderRadius: 80,
            width: 50,
            height: 50,
            fontSize: 25,
            paddingTop: 0,
          }}
        >
          +
        </Button>
      </div>
      <Modal
        title="새로운 항목 추가"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="등록하기"
        cancelText="취소"
        okButtonProps={{ disabled: amount ? false : true }}
      >
        <DatePicker
          placeholder={moment().format('YYYY-MM-DD HH:mm')}
          selected={moment(dateTime)}
          format="YYYY-MM-DD HH:mm"
          showTime
          onChange={(date) => dateChangeHandler(date)}
          allowClear={false}
        />
        <Input
          value={category || null}
          onChange={categoryChangeHandler}
          placeholder="항목을 입력하세요"
        />
        <Input
          value={amount || null}
          onChange={amountChangeHandler}
          placeholder="금액을 입력하세요"
          disabled={category ? false : true}
        />
      </Modal>
    </>
  );
};

export default CreateModal;
