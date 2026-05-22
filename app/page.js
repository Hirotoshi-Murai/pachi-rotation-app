"use client";

import { useEffect, useState } from "react";

const machines = {
  フリー: null,
  "e東京喰種": {
    "4円等価": 16.7,
    "3.57円": 17.5,
    "3.3円": 18.1,
    "3.0円": 18.8,
  },
  Pスーパー大海物語IN沖縄6: {
    "4円等価": 17.6,
    "3.57円": 18.6,
    "3.3円": 19.2,
    "3.0円": 20.0,
  },
    P大海物語5: {
    "4円等価": 17.7,
    "3.57円": 18.6,
    "3.3円": 19.2,
    "3.0円": 20.1,
  },
    エヴァ15: {
    "4円等価": 17.8,
    "3.57円": 18.7,
    "3.3円": 19.4,
    "3.0円": 20.2,
  },
    eリコリス・リコイル: {
    "4円等価": 17.2,
    "3.57円": 18.1,
    "3.3円": 18.6,
    "3.0円": 19.4,
  },
};

export default function Home() {
  const [machine, setMachine] = useState("フリー");
  const [startGame, setStartGame] = useState("");
  const [currentGame, setCurrentGame] = useState("");
  const [manualAmount, setManualAmount] = useState("");
  const [activeInput, setActiveInput] = useState("start");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("pachi-records");
    if (saved) setRecords(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("pachi-records", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        console.log(err);
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, []);

  const totalInvestment = records.reduce((sum, r) => sum + r.amount, 0);
  const totalSpins = records.reduce((sum, r) => sum + r.spins, 0);

  const totalRate =
    totalInvestment > 0
      ? (totalSpins / (totalInvestment / 1000)).toFixed(1)
      : "0.0";

  const inputValue =
    activeInput === "start"
      ? startGame
      : activeInput === "current"
      ? currentGame
      : manualAmount;

  const setInputValue = (value) => {
    if (activeInput === "start") setStartGame(value);
    if (activeInput === "current") setCurrentGame(value);
    if (activeInput === "manual") setManualAmount(value);
  };

  const pressNumber = (num) => {
    setInputValue(String(inputValue) + num);
  };

  const backspace = () => {
    setInputValue(String(inputValue).slice(0, -1));
  };

  const clearInput = () => {
    setInputValue("");
  };

  const addInvestment = (amount) => {
    const start = records.length > 0 ? Number(startGame) : Number(startGame);
    const end = Number(currentGame);

    if (startGame === "" || currentGame === "" || end <= start || amount <= 0)
      return;

    const spins = end - start;
    const sectionRate = (spins / (amount / 1000)).toFixed(1);
    const newTotalInvestment = totalInvestment + amount;
    const newTotalSpins = totalSpins + spins;
    const cumulativeRate = (
      newTotalSpins /
      (newTotalInvestment / 1000)
    ).toFixed(1);

    const text = `${start}→${end} +${spins} 投${newTotalInvestment}円 区間${sectionRate} 累計${cumulativeRate}`;

    const record = {
      text,
      start,
      end,
      spins,
      amount,
      totalInvestment: newTotalInvestment,
      totalSpins: newTotalSpins,
      sectionRate,
      cumulativeRate,
    };

    setRecords([record, ...records]);
    setStartGame(String(end));
    setCurrentGame("");
    setManualAmount("");
    setActiveInput("current");
  };

  const hitReset = () => {
    setStartGame("");
    setCurrentGame("");
    setManualAmount("");
    setActiveInput("start");
  };

  const deleteRecord = (index) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  const copyRecords = async () => {
    const text = records.map((r) => r.text).join("\n");
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    alert("コピーしました。履歴を削除します。");
    setRecords([]);
    setStartGame("");
    setCurrentGame("");
    setManualAmount("");
    setActiveInput("start");
  };

  const border = machines[machine];

  const selectedClass = "border-blue-600 bg-blue-50 ring-2 ring-blue-300";

  return (
    <div className="min-h-screen bg-gray-100 p-4 text-gray-900">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-4 space-y-4">
        <h1 className="text-2xl font-bold">パチンコ回転数メモ</h1>

        <div>
          <label className="block text-sm font-semibold mb-1">機種選択</label>
          <select
            value={machine}
            onChange={(e) => setMachine(e.target.value)}
            className="w-full border rounded-xl p-2"
          >
            {Object.keys(machines).map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </div>

        {border && (
          <div className="bg-gray-100 rounded-xl p-3 text-sm">
            <div className="font-semibold mb-2">ボーダー</div>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(border).map(([rate, value]) => (
                <div key={rate}>
                  {rate}：{value}/k
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1">
            スタート回転数／前回回転数
          </label>
          <button
            onClick={() => setActiveInput("start")}
            className={`w-full border rounded-xl p-3 text-left text-xl ${
              activeInput === "start" ? selectedClass : ""
            }`}
          >
            {startGame || "ここを選択"}
          </button>
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="block text-sm font-semibold">現在回転数</label>
            <span className="text-sm font-semibold">回転率 {totalRate}/k</span>
          </div>
          <button
            onClick={() => setActiveInput("current")}
            className={`w-full border rounded-xl p-3 text-left text-xl ${
              activeInput === "current" ? selectedClass : ""
            }`}
          >
            {currentGame || "ここを選択"}
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {["1", "2", "3", "4", "5"].map((n) => (
            <button
              key={n}
              onClick={() => pressNumber(n)}
              className="bg-gray-200 rounded-xl py-3 font-bold"
            >
              {n}
            </button>
          ))}
          <button
            onClick={backspace}
            className="bg-gray-300 rounded-xl py-3 font-bold"
          >
            ←
          </button>

          {["6", "7", "8", "9", "0"].map((n) => (
            <button
              key={n}
              onClick={() => pressNumber(n)}
              className="bg-gray-200 rounded-xl py-3 font-bold"
            >
              {n}
            </button>
          ))}
          <button
            onClick={clearInput}
            className="bg-gray-300 rounded-xl py-3 font-bold"
          >
            C
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => addInvestment(500)}
            className="bg-black text-white rounded-xl py-3 font-semibold"
          >
            +500円
          </button>
          <button
            onClick={() => addInvestment(1000)}
            className="bg-black text-white rounded-xl py-3 font-semibold"
          >
            +1000円
          </button>
          <button
            onClick={() => addInvestment(Number(manualAmount))}
            className="bg-blue-600 text-white rounded-xl py-3 font-semibold"
          >
            +手動金額
          </button>
        </div>

        <button
          onClick={() => setActiveInput("manual")}
          className={`w-full border rounded-xl p-3 text-left text-xl ${
            activeInput === "manual" ? selectedClass : ""
          }`}
        >
          {manualAmount || "ここに金額入力"}
        </button>

        <button
          onClick={hitReset}
          className="w-full bg-red-600 text-white rounded-2xl py-3 font-semibold"
        >
          大当りリセット
        </button>

        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">履歴</h2>
          <div className="space-y-2 text-sm">
            {records.map((record, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-xl p-2 flex justify-between gap-2"
              >
                <span>{record.text}</span>
                <button
                  onClick={() => deleteRecord(index)}
                  className="text-red-500 text-xs shrink-0"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={copyRecords}
          className="w-full bg-green-600 text-white rounded-2xl py-3 font-semibold"
        >
          メモ用にコピー
        </button>
      </div>
    </div>
  );
}