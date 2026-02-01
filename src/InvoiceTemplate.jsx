// src/InvoiceTemplate.jsx
import React, { useState, useEffect, useRef } from 'react';
import { pdf } from '@react-pdf/renderer';
import * as pdfjsLib from 'pdfjs-dist';
import { Plus, Trash2, Image as ImageIcon, FileText, RotateCcw } from 'lucide-react';
import InvoicePDF from './InvoicePDF';

// PDF.js ワーカーの設定
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// 初期データ（リセット用および初回ロード用）
const DEFAULT_DATA = {
  issueDate: '2026年 01月01日',
  recipient: '株式会社○○ 御中',
  sender: {
    name: '山田 花子',
    zip: '000-0000',
    address: '東京都中央区銀座0-0-0 銀座ビル 5F',
    regNumber: 'T1234567890123'
  },
  bankInfo: {
    bankName: '三菱UFJ銀行',
    type: '普通',
    number: '0000000',
    holder: 'ヤマダ ハナコ'
  },
  items: [
    { id: 1, date: '2026.01.01', content: 'SNS PR 交通費', quantity: 1, unit: '円', price: 3000 },
    { id: 2, date: '', content: '', quantity: 0, unit: '', price: 0 },
    { id: 3, date: '', content: '', quantity: 0, unit: '', price: 0 },
    { id: 4, date: '', content: '', quantity: 0, unit: '', price: 0 },
  ],
  accountInfo: {
    name: 'インスタアカウント-花子-',
    id: 'ここにIDを入力',
    email: 'example@email.com'
  }
};

const InvoiceTemplate = () => {
  const invoiceRef = useRef(null);

  // ステート初期化：localStorageにデータがあればそれを使い、なければデフォルトを使う
  const [showInvoice, setShowInvoice] = useState(() => {
    const saved = localStorage.getItem('invoice_showReg');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [showEmail, setShowEmail] = useState(() => {
    const saved = localStorage.getItem('invoice_showEmail');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('invoice_data');
    return saved ? JSON.parse(saved) : DEFAULT_DATA;
  });

  // データが変更されるたびにlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('invoice_data', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('invoice_showReg', JSON.stringify(showInvoice));
  }, [showInvoice]);

  useEffect(() => {
    localStorage.setItem('invoice_showEmail', JSON.stringify(showEmail));
  }, [showEmail]);

  // 入力をリセットする機能
  const handleReset = () => {
    if (window.confirm('入力内容を初期状態に戻しますか？')) {
      setData(DEFAULT_DATA);
      setShowInvoice(true);
      setShowEmail(true);
      localStorage.removeItem('invoice_data');
      localStorage.removeItem('invoice_showReg');
      localStorage.removeItem('invoice_showEmail');
    }
  };

  // 計算ロジック
  const calculatedTotal = data.items.reduce((acc, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return acc + (price * qty);
  }, 0);

  // ハンドラー系
  const handleSenderChange = (field, value) => {
    setData({ ...data, sender: { ...data.sender, [field]: value } });
  };
  const handleBankChange = (field, value) => {
    setData({ ...data, bankInfo: { ...data.bankInfo, [field]: value } });
  };
  const handleAccountChange = (field, value) => {
    setData({ ...data, accountInfo: { ...data.accountInfo, [field]: value } });
  };
  const handleItemChange = (id, field, value) => {
    const newItems = data.items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setData({ ...data, items: newItems });
  };
  const addItem = () => {
    const newId = Math.max(...data.items.map(i => i.id), 0) + 1;
    setData({ ...data, items: [...data.items, { id: newId, date: '', content: '', quantity: 0, unit: '', price: 0 }] });
  };
  const removeItem = (id) => {
    if (data.items.length <= 1) return;
    setData({ ...data, items: data.items.filter((item) => item.id !== id) });
  };

  // ダウンロード機能
  const handleDownload = async (type) => {
    // @react-pdf/rendererを使用してPDFを生成
    const blob = await pdf(
      <InvoicePDF
        data={data}
        showInvoice={showInvoice}
        showEmail={showEmail}
        calculatedTotal={calculatedTotal}
      />
    ).toBlob();

    if (type === 'pdf') {
      // PDFをダウンロード
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `請求書_${data.recipient}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      // 画像ダウンロードの場合はPDFをPNGに変換
      try {
        // PDFをArrayBufferとして読み込む
        const arrayBuffer = await blob.arrayBuffer();

        // PDF.jsでPDFを読み込む
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdfDocument = await loadingTask.promise;

        // 1ページ目を取得
        const page = await pdfDocument.getPage(1);

        // 高解像度でレンダリング（scale=3で3倍）
        const scale = 3;
        const viewport = page.getViewport({ scale });

        // Canvasを作成
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // PDFをCanvasにレンダリング
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        // CanvasをPNG画像に変換
        const imgData = canvas.toDataURL('image/png');

        // モバイルデバイスかつWeb Share APIが使える場合は共有メニューを開く
        if (navigator.share && navigator.canShare) {
          try {
            // canvas を Blob に変換
            const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            const file = new File([imageBlob], `請求書_${data.recipient}.png`, { type: 'image/png' });

            // 共有可能かチェック
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: '請求書',
                text: `請求書_${data.recipient}`
              });
              return;
            }
          } catch (error) {
            // 共有がキャンセルされた場合やエラーの場合は通常のダウンロードにフォールバック
            console.log('Share cancelled or failed:', error);
          }
        }

        // 通常のダウンロード（デスクトップまたは共有に失敗した場合）
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `請求書_${data.recipient}.png`;
        link.click();
      } catch (error) {
        console.error('PDF to image conversion failed:', error);
        alert('画像の生成に失敗しました。');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {/* 固定ツールバー */}
      <div className="sticky top-0 z-50 w-full bg-white shadow-md border-b border-gray-200">
        <div className="max-w-[210mm] mx-auto p-3 md:p-4 flex flex-wrap gap-3 md:gap-4 justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <h2 className="font-bold text-gray-700 text-base md:text-lg">請求書作成</h2>
            <button onClick={handleReset} className="text-xs md:text-sm flex items-center gap-1 text-gray-500 hover:text-red-500 border border-gray-300 px-2 md:px-3 py-1.5 md:py-2 rounded min-h-[44px] md:min-h-0">
              <RotateCcw size={14}/><span className="hidden sm:inline">リセット</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-2 md:px-3 py-2 md:py-2 rounded border border-gray-200 hover:bg-gray-100 transition min-h-[44px] md:min-h-0">
              <input
                type="checkbox"
                checked={showInvoice}
                onChange={(e) => setShowInvoice(e.target.checked)}
                className="w-5 h-5 md:w-4 md:h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-gray-700">インボイス</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-50 px-2 md:px-3 py-2 md:py-2 rounded border border-gray-200 hover:bg-gray-100 transition min-h-[44px] md:min-h-0">
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="w-5 h-5 md:w-4 md:h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs md:text-sm font-medium text-gray-700">メール</span>
            </label>

            <div className="flex gap-2">
              <button onClick={() => handleDownload('image')} className="flex items-center gap-1.5 md:gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2.5 md:py-2 rounded transition text-xs md:text-sm font-bold min-h-[44px] md:min-h-0">
                <ImageIcon size={16} /><span>画像</span>
              </button>
              <button onClick={() => handleDownload('pdf')} className="flex items-center gap-1.5 md:gap-2 bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 py-2.5 md:py-2 rounded transition text-xs md:text-sm font-bold min-h-[44px] md:min-h-0">
                <FileText size={16} /><span>PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 請求書用紙エリア (A4サイズ) */}
      <div className="p-2 md:p-8 flex justify-center">
        <div className="bg-white shadow-2xl w-full md:w-[210mm] relative overflow-hidden text-xs md:text-sm" ref={invoiceRef}>
          <div className="p-4 md:p-8 flex flex-col">
          
          {/* ヘッダー */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-3 gap-3">
            <div className="bg-blue-600 text-white text-xl md:text-2xl font-bold px-3 md:px-4 py-1 inline-block">
              請求書
            </div>
            <div className="border border-gray-400 flex text-xs md:text-sm items-center">
              <div className="bg-gray-100 px-2 py-2.5 md:py-1.5 border-r border-gray-400 flex items-center min-w-[60px]">発行日</div>
              <input
                value={data.issueDate}
                onChange={(e) => setData({...data, issueDate: e.target.value})}
                className="px-2 py-2.5 md:py-1.5 outline-none text-center w-full md:w-40 text-sm md:text-sm min-h-[44px] md:min-h-0 leading-relaxed"
              />
            </div>
          </div>

          <div className="mb-3">
            <input
              value={data.recipient}
              onChange={(e) => setData({...data, recipient: e.target.value})}
              className="text-base md:text-xl font-bold border-b border-gray-300 w-full outline-none py-2.5 md:py-1.5 min-h-[44px] md:min-h-0 leading-relaxed"
            />
          </div>

          {/* 氏名・住所 */}
          <div className="border border-gray-400 w-full md:w-2/3 mb-2">
            <div className="flex border-b border-gray-400 items-center">
              <div className="w-14 md:w-16 bg-gray-50 py-2.5 px-2 border-r border-gray-400 font-bold flex items-center text-xs md:text-sm">氏名</div>
              <input value={data.sender.name} onChange={(e) => handleSenderChange('name', e.target.value)} className="flex-1 py-2.5 px-2 outline-none font-bold text-base md:text-lg min-h-[44px] md:min-h-0 leading-relaxed"/>
            </div>
            <div className="flex border-b border-gray-400 items-center">
              <div className="w-14 md:w-16 bg-gray-50 py-2.5 md:py-1.5 px-2 border-r border-gray-400 font-bold flex items-center text-xs">〒</div>
              <input value={data.sender.zip} onChange={(e) => handleSenderChange('zip', e.target.value)} className="flex-1 py-2.5 md:py-1.5 px-2 outline-none text-sm md:text-base min-h-[44px] md:min-h-0 leading-relaxed"/>
            </div>
            <div className="flex items-center">
              <div className="w-14 md:w-16 bg-gray-50 py-2.5 md:py-1.5 px-2 border-r border-gray-400 font-bold flex items-center text-xs md:text-sm">住所</div>
              <textarea value={data.sender.address} onChange={(e) => handleSenderChange('address', e.target.value)} className="flex-1 py-2.5 md:py-1.5 px-2 outline-none resize-none h-20 md:h-12 leading-relaxed text-sm md:text-base"/>
            </div>
          </div>

          <div className="mb-1 min-h-[24px] flex justify-end items-center">
            {showInvoice && (
              <div className="text-xs text-gray-500 flex flex-wrap items-center gap-1">
                <span>登録番号:</span>
                <input value={data.sender.regNumber} onChange={(e) => handleSenderChange('regNumber', e.target.value)} className="outline-none border-b border-gray-300 w-32 text-right min-h-[36px] md:min-h-0 py-1 px-1 leading-relaxed" placeholder="T1234567890123"/>
              </div>
            )}
          </div>

          {/* 金額 */}
          <div className="mb-3">
            <p className="mb-1.5 text-gray-700 text-xs md:text-sm leading-relaxed">下記の通り、ご請求申し上げます。</p>
            <div className="border border-blue-600">
              <div className="bg-blue-600 text-white text-center py-2 md:py-1.5 font-bold text-sm md:text-base flex items-center justify-center leading-relaxed">ご請求金額 (税込)</div>
              <div className="text-center py-4 md:py-4 text-2xl md:text-4xl font-bold tracking-wider flex items-center justify-center leading-relaxed">¥{calculatedTotal.toLocaleString()}</div>
            </div>
          </div>

          {/* 振込先 */}
          <div className="flex border border-gray-400 mb-4 w-full md:w-3/4">
            <div className="bg-blue-600 text-white w-12 md:w-16 flex items-center justify-center font-bold p-2 text-xs md:text-sm" style={{writingMode: 'vertical-rl'}}>振込先</div>
            <div className="flex-1">
              <div className="border-b border-gray-400 py-2.5 px-2 flex items-center">
                <input value={data.bankInfo.bankName} onChange={(e) => handleBankChange('bankName', e.target.value)} className="w-full outline-none font-medium text-sm md:text-base min-h-[40px] md:min-h-0 leading-relaxed"/>
              </div>
              <div className="border-b border-gray-400 flex items-center">
                <div className="w-14 md:w-16 border-r border-gray-400 py-2.5 px-2 bg-gray-50 text-xs flex items-center justify-center">普通</div>
                <input value={data.bankInfo.number} onChange={(e) => handleBankChange('number', e.target.value)} className="w-full outline-none py-2.5 px-2 text-sm md:text-base min-h-[40px] md:min-h-0 leading-relaxed"/>
              </div>
              <div className="py-2.5 px-2 flex items-center">
                <input value={data.bankInfo.holder} onChange={(e) => handleBankChange('holder', e.target.value)} className="w-full outline-none font-medium text-sm md:text-base min-h-[40px] md:min-h-0 leading-relaxed"/>
              </div>
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-400 text-xs md:text-sm">
              <thead>
                <tr className="bg-blue-600 text-white text-center">
                  <th className="py-2.5 md:py-2 px-1 border border-white font-normal w-16 md:w-24 text-[10px] md:text-sm align-middle leading-relaxed">日付</th>
                  <th className="py-2.5 md:py-2 px-1 border border-white font-normal text-[10px] md:text-sm align-middle leading-relaxed">内容</th>
                  <th className="py-2.5 md:py-2 px-1 border border-white font-normal w-10 md:w-12 text-[10px] md:text-sm align-middle leading-relaxed">数量</th>
                  <th className="py-2.5 md:py-2 px-1 border border-white font-normal w-10 md:w-12 text-[10px] md:text-sm align-middle leading-relaxed">単位</th>
                  <th className="py-2.5 md:py-2 px-1 border border-white font-normal w-16 md:w-20 text-[10px] md:text-sm align-middle leading-relaxed">単価</th>
                  {showInvoice && <th className="py-2.5 md:py-2 px-1 border border-white font-normal w-10 md:w-12 text-[10px] md:text-sm align-middle leading-relaxed">税率</th>}
                  <th className="py-2.5 md:py-2 px-1 border border-white font-normal w-20 md:w-24 text-[10px] md:text-sm align-middle leading-relaxed">金額(税込)</th>
                  <th className="p-0 w-6 md:w-8 hide-on-export bg-white border-none"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="border border-gray-400 p-0 align-middle"><input value={item.date} onChange={(e) => handleItemChange(item.id, 'date', e.target.value)} className="w-full py-2.5 md:py-2 px-1.5 outline-none text-center text-xs md:text-sm min-h-[44px] md:min-h-0 leading-relaxed"/></td>
                    <td className="border border-gray-400 p-0 align-middle"><input value={item.content} onChange={(e) => handleItemChange(item.id, 'content', e.target.value)} className="w-full py-2.5 md:py-2 px-1.5 outline-none text-left text-xs md:text-sm min-h-[44px] md:min-h-0 leading-relaxed"/></td>
                    <td className="border border-gray-400 p-0 align-middle"><input type="number" value={item.quantity === 0 ? '' : item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full py-2.5 md:py-2 px-1.5 outline-none text-right text-xs md:text-sm min-h-[44px] md:min-h-0 leading-relaxed"/></td>
                    <td className="border border-gray-400 p-0 align-middle"><input value={item.unit} onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)} className="w-full py-2.5 md:py-2 px-1.5 outline-none text-center text-xs md:text-sm min-h-[44px] md:min-h-0 leading-relaxed"/></td>
                    <td className="border border-gray-400 p-0 align-middle"><input type="number" value={item.price === 0 ? '' : item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="w-full py-2.5 md:py-2 px-1.5 outline-none text-right text-xs md:text-sm min-h-[44px] md:min-h-0 leading-relaxed"/></td>
                    {showInvoice && <td className="border border-gray-400 p-0 align-middle"><div className="flex items-center justify-center h-full min-h-[44px] md:min-h-0 py-2"><span className="text-[10px] md:text-xs leading-relaxed">10%</span></div></td>}
                    <td className="border border-gray-400 py-2.5 md:py-2 px-1.5 text-right text-xs md:text-sm leading-relaxed align-middle">{item.quantity && item.price ? `¥${(item.quantity * item.price).toLocaleString()}` : ''}</td>
                    <td className="p-0 border-none hide-on-export">
                      <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 p-2 min-h-[40px] md:min-h-0 flex items-center justify-center"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={showInvoice ? 6 : 5} className="border-none text-right p-1 md:p-2"></td>
                  <td className="bg-blue-600 text-white text-center py-2.5 md:py-2 px-1.5 font-bold text-xs md:text-sm leading-relaxed align-middle">合計</td>
                  <td className="border border-gray-400 py-2.5 md:py-2 px-1.5 text-right font-bold text-sm md:text-lg leading-relaxed align-middle">¥{calculatedTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6 hide-on-export">
            <button onClick={addItem} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 md:py-2 rounded-lg transition font-bold text-sm shadow-md min-h-[48px] md:min-h-0 w-full md:w-auto justify-center">
              <Plus size={18} /> 行を追加
            </button>
          </div>

          <div className="mt-auto mb-4 w-full md:w-1/2 border border-gray-400 text-xs md:text-sm">
             <div className="flex border-b border-gray-400 items-center">
               <div className="w-20 md:w-24 bg-gray-50 py-2.5 px-2 border-r border-gray-400 text-xs flex items-center">アカウント名</div>
               <input value={data.accountInfo.name} onChange={(e) => handleAccountChange('name', e.target.value)} className="flex-1 py-2.5 px-2 outline-none text-xs md:text-sm min-h-[40px] md:min-h-0 leading-relaxed"/>
             </div>
             <div className={`flex items-center ${showEmail ? 'border-b border-gray-400' : ''}`}>
               <div className="w-20 md:w-24 bg-gray-50 py-2.5 px-2 border-r border-gray-400 text-xs flex items-center justify-center">ID @</div>
               <input value={data.accountInfo.id} onChange={(e) => handleAccountChange('id', e.target.value)} className="flex-1 py-2.5 px-2 outline-none text-xs md:text-sm min-h-[40px] md:min-h-0 leading-relaxed"/>
             </div>
             {showEmail && (
               <div className="flex items-center">
                 <div className="w-20 md:w-24 bg-gray-50 py-2.5 px-2 border-r border-gray-400 text-xs flex items-center justify-center">メール</div>
                 <input value={data.accountInfo.email || ''} onChange={(e) => handleAccountChange('email', e.target.value)} className="flex-1 py-2.5 px-2 outline-none text-xs md:text-sm min-h-[40px] md:min-h-0 leading-relaxed" placeholder="example@email.com"/>
               </div>
             )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;