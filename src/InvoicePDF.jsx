// src/InvoicePDF.jsx
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 日本語フォントの登録
Font.register({
  family: 'IPAGothic',
  src: '/fonts/ipag.ttf',
});

// スタイル定義
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'IPAGothic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '5 15',
  },
  issueDateBox: {
    border: '1px solid #9ca3af',
    flexDirection: 'row',
  },
  issueDateLabel: {
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRight: '1px solid #9ca3af',
    minWidth: 60,
  },
  issueDateValue: {
    padding: 8,
    minWidth: 120,
    textAlign: 'center',
  },
  recipient: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottom: '1px solid #d1d5db',
  },
  senderBox: {
    border: '1px solid #9ca3af',
    width: '66%',
    marginBottom: 10,
  },
  senderRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #9ca3af',
  },
  senderRowLast: {
    flexDirection: 'row',
  },
  senderLabel: {
    width: 60,
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRight: '1px solid #9ca3af',
    fontWeight: 'bold',
  },
  senderValue: {
    flex: 1,
    padding: 8,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  registrationNumber: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'right',
    marginBottom: 5,
    minHeight: 15,
  },
  amountSection: {
    marginBottom: 15,
  },
  amountText: {
    marginBottom: 8,
    color: '#374151',
  },
  amountBox: {
    border: '2px solid #2563eb',
  },
  amountHeader: {
    backgroundColor: '#2563eb',
    color: 'white',
    textAlign: 'center',
    padding: 8,
    fontWeight: 'bold',
  },
  amountValue: {
    textAlign: 'center',
    padding: 20,
    fontSize: 28,
    fontWeight: 'bold',
  },
  bankSection: {
    border: '1px solid #9ca3af',
    flexDirection: 'row',
    width: '75%',
    marginBottom: 20,
  },
  bankLabel: {
    width: 50,
    backgroundColor: '#2563eb',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankContent: {
    flex: 1,
  },
  bankRow: {
    borderBottom: '1px solid #9ca3af',
    padding: 8,
  },
  bankRowWithBorder: {
    flexDirection: 'row',
    borderBottom: '1px solid #9ca3af',
  },
  bankRowLast: {
    padding: 8,
  },
  bankType: {
    width: 60,
    borderRight: '1px solid #9ca3af',
    padding: 8,
    backgroundColor: '#f9fafb',
    textAlign: 'center',
  },
  bankNumber: {
    flex: 1,
    padding: 8,
  },
  table: {
    marginBottom: 20,
    border: '1px solid #9ca3af',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    color: 'white',
    textAlign: 'center',
    borderBottom: '1px solid white',
    borderLeft: '1px solid #2563eb',
    borderRight: '1px solid #2563eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #9ca3af',
    borderLeft: '1px solid #9ca3af',
    borderRight: '1px solid #9ca3af',
    textAlign: 'center',
  },
  tableCell: {
    padding: 8,
    borderRight: '1px solid #9ca3af',
  },
  tableCellLast: {
    padding: 8,
  },
  colDate: {
    width: '12%',
  },
  colContent: {
    width: '35%',
    textAlign: 'left',
  },
  colQuantity: {
    width: '8%',
  },
  colUnit: {
    width: '8%',
  },
  colPrice: {
    width: '12%',
    textAlign: 'right',
  },
  colTax: {
    width: '8%',
  },
  colAmount: {
    width: '17%',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    marginTop: 5,
  },
  totalLabel: {
    flex: 1,
  },
  totalLabelCell: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '17%',
  },
  totalValue: {
    border: '1px solid #9ca3af',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'right',
    width: '17%',
  },
  accountBox: {
    border: '1px solid #9ca3af',
    width: '50%',
    marginTop: 10,
  },
  accountRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #9ca3af',
  },
  accountRowLast: {
    flexDirection: 'row',
  },
  accountLabel: {
    width: 90,
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRight: '1px solid #9ca3af',
    fontSize: 9,
  },
  accountValue: {
    flex: 1,
    padding: 8,
    fontSize: 9,
  },
});

const InvoicePDF = ({ data, showInvoice, showEmail, calculatedTotal }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View style={styles.title}>
            <Text>請求書</Text>
          </View>
          <View style={styles.issueDateBox}>
            <View style={styles.issueDateLabel}>
              <Text>発行日</Text>
            </View>
            <View style={styles.issueDateValue}>
              <Text>{data.issueDate}</Text>
            </View>
          </View>
        </View>

        {/* 宛先 */}
        <View style={styles.recipient}>
          <Text>{data.recipient}</Text>
        </View>

        {/* 差出人情報 */}
        <View style={styles.senderBox}>
          <View style={styles.senderRow}>
            <View style={styles.senderLabel}>
              <Text>氏名</Text>
            </View>
            <View style={styles.senderValue}>
              <Text style={styles.senderName}>{data.sender.name}</Text>
            </View>
          </View>
          <View style={styles.senderRow}>
            <View style={styles.senderLabel}>
              <Text>〒</Text>
            </View>
            <View style={styles.senderValue}>
              <Text>{data.sender.zip}</Text>
            </View>
          </View>
          <View style={styles.senderRowLast}>
            <View style={styles.senderLabel}>
              <Text>住所</Text>
            </View>
            <View style={styles.senderValue}>
              <Text>{data.sender.address}</Text>
            </View>
          </View>
        </View>

        {/* 登録番号 */}
        <View style={styles.registrationNumber}>
          {showInvoice && (
            <Text>登録番号: {data.sender.regNumber}</Text>
          )}
        </View>

        {/* 請求金額 */}
        <View style={styles.amountSection}>
          <Text style={styles.amountText}>下記の通り、ご請求申し上げます。</Text>
          <View style={styles.amountBox}>
            <View style={styles.amountHeader}>
              <Text>ご請求金額 (税込)</Text>
            </View>
            <View style={styles.amountValue}>
              <Text>¥{calculatedTotal.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* 振込先 */}
        <View style={styles.bankSection}>
          <View style={styles.bankLabel}>
            <Text>振{'\n'}込{'\n'}先</Text>
          </View>
          <View style={styles.bankContent}>
            <View style={styles.bankRow}>
              <Text>{data.bankInfo.bankName}</Text>
            </View>
            <View style={styles.bankRowWithBorder}>
              <View style={styles.bankType}>
                <Text>普通</Text>
              </View>
              <View style={styles.bankNumber}>
                <Text>{data.bankInfo.number}</Text>
              </View>
            </View>
            <View style={styles.bankRowLast}>
              <Text>{data.bankInfo.holder}</Text>
            </View>
          </View>
        </View>

        {/* テーブル */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={[styles.tableCell, styles.colDate]}>
              <Text>日付</Text>
            </View>
            <View style={[styles.tableCell, styles.colContent]}>
              <Text>内容</Text>
            </View>
            <View style={[styles.tableCell, styles.colQuantity]}>
              <Text>数量</Text>
            </View>
            <View style={[styles.tableCell, styles.colUnit]}>
              <Text>単位</Text>
            </View>
            <View style={[styles.tableCell, styles.colPrice]}>
              <Text>単価</Text>
            </View>
            {showInvoice && (
              <View style={[styles.tableCell, styles.colTax]}>
                <Text>税率</Text>
              </View>
            )}
            <View style={[styles.tableCellLast, styles.colAmount]}>
              <Text>金額(税込)</Text>
            </View>
          </View>

          {data.items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <View style={[styles.tableCell, styles.colDate]}>
                <Text>{item.date}</Text>
              </View>
              <View style={[styles.tableCell, styles.colContent]}>
                <Text>{item.content}</Text>
              </View>
              <View style={[styles.tableCell, styles.colQuantity]}>
                <Text>{item.quantity || ''}</Text>
              </View>
              <View style={[styles.tableCell, styles.colUnit]}>
                <Text>{item.unit}</Text>
              </View>
              <View style={[styles.tableCell, styles.colPrice]}>
                <Text>{item.price || ''}</Text>
              </View>
              {showInvoice && (
                <View style={[styles.tableCell, styles.colTax]}>
                  <Text>10%</Text>
                </View>
              )}
              <View style={[styles.tableCellLast, styles.colAmount]}>
                <Text>
                  {item.quantity && item.price
                    ? `¥${(item.quantity * item.price).toLocaleString()}`
                    : ''}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.totalRow}>
            <View style={styles.totalLabel}></View>
            <View style={styles.totalLabelCell}>
              <Text>合計</Text>
            </View>
            <View style={styles.totalValue}>
              <Text>¥{calculatedTotal.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* アカウント情報 */}
        <View style={styles.accountBox}>
          <View style={styles.accountRow}>
            <View style={styles.accountLabel}>
              <Text>アカウント名</Text>
            </View>
            <View style={styles.accountValue}>
              <Text>{data.accountInfo.name}</Text>
            </View>
          </View>
          <View style={showEmail ? styles.accountRow : styles.accountRowLast}>
            <View style={styles.accountLabel}>
              <Text>ID @</Text>
            </View>
            <View style={styles.accountValue}>
              <Text>{data.accountInfo.id}</Text>
            </View>
          </View>
          {showEmail && (
            <View style={styles.accountRowLast}>
              <View style={styles.accountLabel}>
                <Text>メール</Text>
              </View>
              <View style={styles.accountValue}>
                <Text>{data.accountInfo.email || ''}</Text>
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF;
