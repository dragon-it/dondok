import React, { useEffect, useState } from 'react';
import { Calendar } from 'antd';
import styled from 'styled-components';
import { lookupByDate, getSpendingCalendar } from '../../../api/requests';
import { formatPrice, formatDate } from '../../../utils/format';
import ItemList from './ItemList';
import Loading from '../../common/Loading';
import dayjs from 'dayjs';
import dummyData from '../../dummyData.json'
import moment from 'moment';


const TheCalendar = () => {
  const [list, setList] = useState(dummyData);
  console.log(list)
  // getSpendingCalendar API 응답 데이터
  const [spending, setSpending] = useState({});
  // getSpendingCalendar API에 필요한 인수 - 기본값: 오늘 날짜 [2023, 7, 11]
  const [selectedDate, setSelectedDate] = useState(
    formatDate(new Date()).split('-').map(Number),
  );

  const [selectedDateDetail, setSelectedDateDetail] = useState([]);
  const [changed, setChanged] = useState(false);

  // 월별 조회 API 응답데이터
  const [monthlySpending, setMonthlySpending] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState('month');

  // 소비 달력 조회 API 호출
  const getSpending = async () => {
    setIsLoading(true);
    try {
      const res = await getSpendingCalendar(selectedDate[0], selectedDate[1]);
      setSelectedDateDetail(res[selectedDate[2]]);
      setSpending(res);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    // 랜더링 시 API 호출
    getSpending();
    getMonthlyData();
  }, [changed]);
  useEffect(() => {
    // 처음 렌더링 시 오늘의 날짜로 클릭
    getDetailList(new Date());
  }, []); // 빈 배열은 처음 렌더링 시에만 실행됨

  // 소비항목 변경시 재렌더링을 위한 상태값변경함수
  const itemChangedHandler = async () => {
    try {
      const res = await getSpendingCalendar(selectedDate[0], selectedDate[1]);
      setSelectedDateDetail(res[selectedDate[2]]);
    } catch (error) {
    }
    setChanged(!changed);
  };

  // 일별, 주별, 월별 조회
  const getMonthlyData = async () => {
    try {
      const res = await lookupByDate('monthly');
      setMonthlySpending(res);
    } catch (error) {

    }
  };


  // 달력의 월 또는 연도를 변경할 때마다 선택한 날짜에 맞는 소비 데이터를 업데이트하여 화면에 출력
  const handlePanelChange = async (value, mode) => {
    // value를 원하는 형식의 문자열로 변환
    setCurrentMode(mode);
    const formattedValue = value.format('YYYY-MM-DD');
    setSelectedDateDetail(spending[formattedValue]); // 선택한 날짜에 맞는 소비 데이터 설정
    // getSpending 함수를 호출하여 선택한 날짜에 맞는 소비 데이터 가져오기
    try {
      const res = await getSpendingCalendar(value.year(), value.month() + 1);
      setSpending(res);

    } catch (error) {
    }
  };

  // 랜더링 시 API 호출
  useEffect(() => {
    getSpending();
    getMonthlyData();
  }, [changed]);

  // Calendar 컴포넌트에 출력될 데이터 API (antd)
  const cellRender = (value, info) => {
    if (info.type === 'date') return dateCellRender(value);
    if (info.type === 'month') return monthCellRender(value);
    return info.originNode;
  };

  const getDetailList = async (date) => {
    try {
      const formattedDate = dayjs(date).format('YYYY-MM-DD');
      console.log('Clicked Date:', formattedDate); // 여기에 추가
      const filteredItems = list.filter(item => dayjs(item.date).format('YYYY-MM-DD') === formattedDate);
      setSelectedDateDetail(filteredItems);  // 기존의 setSelectedDateDetail 대신 setListDetail로 변경
      setSelectedDate(formattedDate.split('-'));
      console.log(filteredItems)
    } catch (error) {
      // 오류 처리 로직 추가
    }
  };
  


const dateCellRender = (value) => {
  const formattedValue = value.format('YYYY-MM-DD');
  // 현재 날짜에 해당하는 지출 데이터를 찾아서 출력

  const filteredData = list.filter(item => dayjs(item.date).format('YYYY-MM-DD') === formattedValue);
  // 해당 날짜의 지출 데이터가 있을 경우 출력
  if (filteredData.length > 0) {
    // 해당 날짜의 지출 데이터가 있을 경우 총 합을 계산
    const totalAmount = filteredData.reduce((acc, item) => acc + item.amount, 0);
    return (
      <p
        style={{
          fontSize: 10,
          marginTop: 16,
          color: '#fc037b',
          wordBreak: 'break-all',
          lineHeight: 1,
          textAlign: 'center',
        }}
      >
        ₩ {formatPrice(totalAmount)}
      </p>
    );
  }

  // 해당 날짜의 지출 데이터가 없을 경우 빈 값을 반환하거나 다른 처리를 수행할 수 있습니다.
  return null;
};


  // 월별 지출 데이터
  const getTotalAmountByMonth = (date) => {
    const formattedMonth = dayjs(date).format('YYYY-MM');
    const filteredItems = list.filter(item => dayjs(item.date).format('YYYY-MM') === formattedMonth);
    const totalAmount = filteredItems.reduce((acc, item) => acc + item.amount, 0);
    return totalAmount;
  };
  
  
  // 월별 지출 조회 API (antd)
  const monthCellRender = (value) => {
    const num = getTotalAmountByMonth(value);
    return num ? (
      <div className="notes-month">
        <span style={{ color: '#eb2f96' }}>₩ {num}</span>
      </div>
    ) : null;
  };
    return (
      <>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <StyledCalender
              value={dayjs(selectedDate).add(9, 'hour')}
              cellRender={cellRender}
              onSelect={(date) => getDetailList(date)}
              onPanelChange={handlePanelChange}
            />
            {currentMode === 'month' ? (
              <ItemList
                list={list} 
                setList={setList}
                listDetail={selectedDateDetail}
                itemChangedHandler={itemChangedHandler}
              />
            ) : null}
          </>
        )}
      </>
    );
  };

  export default TheCalendar;

const StyledCalender = styled(Calendar)`
  width: 100%;
  font-size: 12px;

  .ant-picker-calendar-header {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .ant-picker-cell-inner.ant-picker-calendar-date {
    // height: 50px;
    // margin: 0 5px;
    padding: 0;
  }
  .ant-picker-calendar-date-value {
    font-size: 12px;
    height: 10px;
  }
  .ant-picker-calendar-date-content {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .events {
    height: 100%;
    margin: 0;
    padding: 0;
  }
  .ant-picker-cell {
    overflow: hidden;
  }
  .ant-badge.ant-badge-status {
  }

  .ant-badge-status-text {
    display: inline-block;
    font-family:
      Times,
      Times New Roman,
      Georgia,
      serif;
    margin-top: 5px;
  }

  .ant-picker-cell-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
    // border-color: #35495e;
  }
`;
