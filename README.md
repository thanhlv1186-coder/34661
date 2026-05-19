# Warehouse Dashboard

Dashboard React/Vite cho trang `thongketai.netlify.app`.

## Cap nhat data tu Excel

1. Dat file `.xlsx` moi nhat vao thu muc `data/raw`.
2. Chay lenh:

```bash
npm run data:update
```

Lenh nay se doc file Excel moi nhat trong `data/raw` va sinh lai:

```text
src/generated/warehouse-data.jsx
```

Component `src/warehouse-dashboard.jsx` giu nguyen giao dien/theme va chi import data tu file generated.

## Cap nhat web len Netlify

Cach nhanh nhat tren Windows:

```text
cap-nhat-du-lieu-va-web.bat
```

Batch nay se:

- doc Excel va sinh JSX data;
- build website de kiem tra loi;
- commit thay doi;
- push len GitHub de Netlify tu deploy.

File Excel thô trong `data/raw` duoc ignore khoi Git. Chi file JSX generated duoc commit/deploy.

## Cot Excel duoc ho tro

Generator tu nhan dien nhieu ten cot tieng Viet/thong dung. Khung cot khuyen nghi:

| Cot | Y nghia |
| --- | --- |
| `Vùng` | Ten vung |
| `Tên kho` | Ten kho |
| `NL Tổng` | Nang luc tong |
| `NL ML` | Nang luc may lanh |
| `NL ĐHK` | Nang luc ĐHK |
| `Khai báo ML` | So khai bao may lanh |
| `Khai báo ĐHK` | So khai bao ĐHK |
| `Đã sử dụng ML` | So da su dung may lanh |
| `Đã sử dụng ĐHK` | So da su dung ĐHK |
| `% KB/NL` | Tuy chon, neu bo trong generator se tu tinh |
| `% KB ML` | Tuy chon, neu bo trong generator se tu tinh |
| `% KB ĐHK` | Tuy chon, neu bo trong generator se tu tinh |
| `% NL/DBA ML` | Du bao may lanh |
| `% NL/DBA ĐHK` | Du bao ĐHK |
| `Trạng thái` | Co the dung `🔴`, `🟡`, `🟢` hoac chu `Quá tải`, `Cảnh báo`, `Bình thường` |

Tao file mau:

```bash
npm run data:template
```

File mau nam tai `data/templates/warehouse-template.xlsx`.

Theo doi thu muc va tu sinh lai data moi khi co file Excel moi:

```bash
npm run data:watch
```

## Lenh phat trien

```bash
npm install
npm run dev
npm run build
npm run lint
```
