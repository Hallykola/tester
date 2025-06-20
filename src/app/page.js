'use client';

import Image from "next/image";

import { useEffect , useRef, useState } from 'react';
import { createChart, LineSeries, CandlestickSeries } from 'lightweight-charts';


export default function  Home() {
  const chartContainerRef = useRef();
  const [orders, setOrder] = useState([]);
  const [profit, setProfit] = useState(0);
  const [balance, setBalance] = useState(0);
  const [index, setIndex] = useState(0);
  const ordersRef = useRef([]);
  const newdataRef = useRef([]);
  const initialdataRef = useRef([]);
  const indexRef = useRef(0);
  const linesRef = useRef({}); // Track price lines by order ID
  const seriesRef = useRef();
  //  let index = 0;
    let intervalId = null;
    let isPaused = true;


  // const state = {orders:[]};
  // var orders = []
 
      function calculateSMA(data, period) {
        const sma = [];
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) continue;
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].close;
            }
            sma.push({ time: data[i].time, value: sum / period });
        }
        return sma;
    }

    function calculateProfit(orderlist, current_price){
    const orderlist_copy = [...orderlist];
    // console.log('orderlist copy',orderlist_copy)
    var total_pips = 0
    for (var i = 0; i < orderlist_copy.length; i++){
      var pips = 0;
      if (orderlist_copy[i].ordertype=="BUY"){
        pips = current_price - orderlist_copy[i].orderprice;
      }else{
        pips =  orderlist_copy[i].orderprice - current_price ;
      }
      // console.log('Using in calc profit:',current_price, orderlist_copy[i].orderprice)
      total_pips = total_pips + pips;
    }
    return total_pips
  }

  useEffect(() => {
   
  const chart = createChart(chartContainerRef.current, {
  width: 0.9*window.innerWidth,
  height: 0.8*window.innerHeight,
  });
  const mycandlestickSeries = chart.addSeries(CandlestickSeries);
  mycandlestickSeries.applyOptions({
    priceFormat: {
        type: 'price',
        precision: 5,
        minMove: 0.00001,
    },
});
  seriesRef.current = mycandlestickSeries;
    var data = []
     fetch('/ohlc_data.csv')
      .then((response) => response.text())
      .then((csvText) => {
        const rows = csvText.trim().split('\n');
        const headers = rows[0].split(',');

         data = rows
          .slice(1) // skip header
          .map((row) => {
            const values = row.split(',');
            const original = values[0];
            const isoFormat = original.replace(" ", "T");
            const date = new Date(isoFormat); 
            const unixTimestamp = Math.floor(date.getTime() / 1000);
            return {
              time: unixTimestamp, //values[0], // string date like "2024-06-01"
              open: parseFloat(values[1]),
              high: parseFloat(values[2]),
              low: parseFloat(values[3]),
              close: parseFloat(values[4]),
            };
          });
     
        // console.log('data 1',data)
      var initialdata = data.slice(0, 20 + 1);
      var newdata = data.slice(21, data.length);
      newdataRef.current = newdata;
      initialdata.ref = initialdata;
    if (!chartContainerRef.current) return;

    

    // const data = [{ open: 10, high: 10.63, low: 9.49, close: 9.55, time: 1642427876 }, { open: 9.55, high: 10.30, low: 9.42, close: 9.94, time: 1642514276 }, { open: 9.94, high: 10.17, low: 9.92, close: 9.78, time: 1642600676 }, { open: 9.78, high: 10.59, low: 9.18, close: 9.51, time: 1642687076 }, { open: 9.51, high: 10.46, low: 9.10, close: 10.17, time: 1642773476 }, { open: 10.17, high: 10.96, low: 10.16, close: 10.47, time: 1642859876 }, { open: 10.47, high: 11.39, low: 10.40, close: 10.81, time: 1642946276 }, { open: 10.81, high: 11.60, low: 10.30, close: 10.75, time: 1643032676 }, { open: 10.75, high: 11.60, low: 10.49, close: 10.93, time: 1643119076 }, { open: 10.93, high: 11.53, low: 10.76, close: 10.96, time: 1643205476 }];
  
  mycandlestickSeries.setData(initialdata);
  var smaData = calculateSMA(initialdata, 5); // 3-period simple moving average
   const smaSeries = chart.addSeries(LineSeries,{
        color: 'blue',
        lineWidth: 2,
        title: '5-SMA',
    });
    smaSeries.setData(smaData);
    var sma2Data = calculateSMA(initialdata, 20); // 3-period simple moving average
   const sma2Series = chart.addSeries(LineSeries,{
        color: 'gold',
        lineWidth: 2,
        title: '20-SMA',
    });
    sma2Series.setData(sma2Data);

// chart.timeScale().fitContent();
    // let index = 0;
    // let intervalId = null;
    // let isPaused = true;

    function startLoop() {
      console.log('how va?')
      if (!isPaused || indexRef.current >= newdata.length) return;
       
      isPaused = false;

      intervalId = setInterval(() => {
        console.log('how va interval?')
        if (indexRef.current < newdata.length) {
          console.log('how va 2 int?',newdata.length)
          mycandlestickSeries.update(newdata[indexRef.current]);
          console.log('newdata plus index ',newdata[indexRef.current],index,indexRef.current)
          initialdata.push(newdata[indexRef.current]);
          initialdataRef.current = initialdata;
          smaData = calculateSMA(initialdata, 5); 
          smaSeries.update(smaData[smaData.length - 1]);
          console.log(initialdata);
          sma2Data = calculateSMA(initialdata, 20); 
          sma2Series.update(sma2Data[sma2Data.length - 1]);
          var current_profit = calculateProfit(ordersRef.current, initialdata[initialdata.length-1].close); //newdata[index].close)
          // console.log("after calc:",orders,current_profit, newdata[index])
          setProfit(aprofit=>current_profit);
          setIndex(oldindex=>{ 
            const newindex = oldindex + 1; 
            indexRef.current = newindex;
            return newindex;
          });
          // index++;
          // newdataRef = 
          
            ordersRef.current.forEach(order => {
              console.log('in for each',order.ordertype,order.orderid);
      const price = initialdata[initialdata.length-1].close;
      const profit = (price - order.orderprice) * (order.ordertype === 'BUY' ? 1 : -1);
      const title = `P/L ${order.orderid}. ${order.ordertype}: ${profit.toFixed(4)}`;
      const color = profit >= 0 ? 'green' : 'red';

      // Add or update price line
      if (!linesRef.current[order.orderid]) {
        const line = seriesRef.current.createPriceLine({
          price: order.orderprice,
          color,
          lineWidth: 2,
          title,
          axisLabelVisible: true,
        });
        linesRef.current[order.orderid] = line;
      } else {
        linesRef.current[order.orderid].applyOptions({
          title,
          color,
        });
      } } )
        // linesRef.current.forEach((key, value)=>{
        //   if (!ordersRef.current[key]){
        //     delete(linesRef.current[value]);
        //   }
        // });
          Object.entries(linesRef.current).forEach(([orderId, line]) => {
      const stillExists = ordersRef.current.find(order => order.orderid.toString() === orderId);
      if (!stillExists) {
        seriesRef.current.removePriceLine(line);
        delete linesRef.current[orderId];
      }
    });
          
        } else {
          console.log('how va 2 int no work?',index, indexRef, newdata.length)
          clearInterval(intervalId);
        }
      }, 300); // 1 second = simulate 5 minutes // 1000
    }

    function toggleLoop(){
      if ( isPaused == true){
        startLoop();
      }else{
        pauseLoop();
      }
    }

    function pauseLoop() {
      isPaused = true;
      clearInterval(intervalId);
    }
    function resetLoop() {
      isPaused = true;
      clearInterval(intervalId);
      initialdata = data.slice(0, 20 + 1);
      newdata = data.slice(21, data.length);
      newdataRef.current = newdata;
      smaData = calculateSMA(initialdata, 5);
      sma2Data = calculateSMA(initialdata, 20); 
      smaSeries.setData(smaData);
      sma2Series.setData(sma2Data);
      mycandlestickSeries.setData(initialdata);
      setOrder(prevOrders =>{
      const updatedOrders = [];
      ordersRef.current = updatedOrders;
      return updatedOrders
    });
      setProfit(0);
    }

    function buyorder(){
    const time = newdata[indexRef.current-1].time
    const price = newdata[indexRef.current-1].close
    const size = 0.01
    const anordertype = "BUY"
    addOrder(anordertype,time,indexRef.current,size,price)
    const orderPrice = price;
    // const priceLine = mycandlestickSeries.createPriceLine({
    //     price: orderPrice,
    //     color: 'green',
    //     lineWidth: 2,
    //     lineStyle: 0, // 0 = Solid, 1 = Dotted, 2 = Dashed
    //     axisLabelVisible: true,
    //     title: 'Buy Order',
    // });
  }
  function sellorder(){
    const time = newdata[indexRef.current-1].time
    const price = newdata[indexRef.current-1].close
    const size = 0.01
    const anordertype = "SELL"
    addOrder(anordertype,time,indexRef.current,size,price)
    const orderPrice = price;
    // const priceLine = mycandlestickSeries.createPriceLine({
    //     price: orderPrice,
    //     color: 'red',
    //     lineWidth: 2,
    //     lineStyle: 0, // 0 = Solid, 1 = Dotted, 2 = Dashed
    //     axisLabelVisible: true,
    //     title: 'Sell Order',
    // });
  }

 
 
 
    document.getElementById('play').addEventListener('click', startLoop);
    document.getElementById('pause').addEventListener('click', pauseLoop);
    document.getElementById('toggle').addEventListener('click', toggleLoop);
    document.getElementById('reset').addEventListener('click', resetLoop);

    document.getElementById('buy').addEventListener('click', buyorder );
    document.getElementById('sell').addEventListener('click', sellorder);

     
    
   });
window.addEventListener('resize', () => {
    chart.resize(window.innerWidth, window.innerHeight);
});

 function addOrder(anordertype,time,index,size,price){
    const id = new Date().getTime();
    // console.log(id)
    const neworder = {
      orderid:id,
      ordertype: anordertype,
      ordertime: time,
      orderindex: index,
      ordersize: size,
      orderprice: price
    }
    // var oldorders = orders;
    // oldorders.push(neworder);
    console.log(neworder)
    
    setOrder(prevOrders =>{
      const updatedOrders = [...prevOrders, neworder]
      ordersRef.current = updatedOrders;
      return updatedOrders
    });
    
    
    // console.log(orders);
  }
    // Cleanup on component unmount
    return () => {
      chart.remove();
    };
  }, []);

  function removeOrder(orderid){
    const all_orders = orders;
    const updated_order = all_orders.filter((val,index,arr)=>val.orderid != orderid);
    const removed_order = all_orders.filter((val,index,arr)=>val.orderid == orderid);
    setOrder(()=>{
      ordersRef.current = updated_order;
      return updated_order;
    });
    
    return removed_order;
  }

 function closeOrder(orderid){
    const removed_order = removeOrder(orderid);
    const order_profit = calculateProfit(removed_order, newdataRef.current[indexRef.current].close)
    console.log('calc profit on close',removed_order, newdataRef.current[indexRef.current].close)
    setBalance(current_balance=>current_balance+order_profit);
    // for removing orderline add to add it even if it violates seperation of concern
    const line = linesRef.current[orderid];
    seriesRef.current.removePriceLine(line);
    delete linesRef.current[orderid];
  }
  return (
    <div>
     <h1>Stock Chart ({balance})</h1>
      <div ref={chartContainerRef} />
      {orders.map((value,orderindex)=> <h1 key={value.orderid}>{orderindex} {value.orderid} {((initialdataRef.current[initialdataRef.current.length-1].close - value.orderprice)* (value.ordertype === 'BUY' ? 1 : -1)).toFixed(4)} <button onClick={()=>{closeOrder(value.orderid);console.log('CLOSE',value.orderid,newdataRef.current[indexRef.current].close,value.orderprice);}}>CLOSE</button> </h1>)}
      {profit}
      
      <button id="toggle">Pause/Play</button>
      <br/>
      <button id="play">Play</button>
      <br/>
      <button id="pause">Pause</button>
      <button id="reset">Reset</button>
      <br/>
      <br/>
      <button id="buy">BUY</button>
      <br/>
      <br/>
      <button id="sell">SELL</button>
    </div>
   
    
  );
}
