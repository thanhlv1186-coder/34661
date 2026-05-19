import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell, PieChart, Pie, Legend } from "recharts";

const REGIONS = [
  { name: "Đông Tây Bắc", short: "ĐTB", capacity: 1600, ac: 610, dhk: 990, declared: 1593, declAC: 539, declDHK: 1054, used: 829, usedAC: 285, usedDHK: 544, remain: 764, pctDecl: 100, pctAC: 88, pctDHK: 106, pctForeAC: 104, pctForeDHK: 77, status: "🟢" },
  { name: "Đồng Bằng Sông Hồng", short: "ĐBSH", capacity: 1954, ac: 847, dhk: 1107, declared: 1844, declAC: 765, declDHK: 1079, used: 1392, usedAC: 523, usedDHK: 869, remain: 438, pctDecl: 94, pctAC: 90, pctDHK: 97, pctForeAC: 138, pctForeDHK: 96, status: "🟢" },
  { name: "Hà Nội +", short: "HN+", capacity: 3057, ac: 1317, dhk: 1740, declared: 3013, declAC: 1057, declDHK: 1956, used: 1628, usedAC: 551, usedDHK: 1077, remain: 1385, pctDecl: 99, pctAC: 80, pctDHK: 112, pctForeAC: 136, pctForeDHK: 82, status: "🟡" },
  { name: "Trung Bộ", short: "TB", capacity: 3223, ac: 1114, dhk: 2109, declared: 3312, declAC: 893, declDHK: 2419, used: 1487, usedAC: 414, usedDHK: 1073, remain: 1825, pctDecl: 103, pctAC: 80, pctDHK: 115, pctForeAC: 136, pctForeDHK: 134, status: "🟢" },
  { name: "Duyên Hải", short: "DH", capacity: 2520, ac: 1120, dhk: 1400, declared: 2232, declAC: 970, declDHK: 1262, used: 1928, usedAC: 915, usedDHK: 1013, remain: 304, pctDecl: 89, pctAC: 87, pctDHK: 90, pctForeAC: 83, pctForeDHK: 104, status: "🟢" },
  { name: "Đông Cao Nguyên", short: "ĐCN", capacity: 5350, ac: 2200, dhk: 3150, declared: 5193, declAC: 1757, declDHK: 3436, used: 4713, usedAC: 2154, usedDHK: 2559, remain: 480, pctDecl: 97, pctAC: 80, pctDHK: 109, pctForeAC: 149, pctForeDHK: 112, status: "🟡" },
  { name: "Hồ Chí Minh", short: "HCM", capacity: 3797, ac: 1687, dhk: 2110, declared: 3379, declAC: 1096, declDHK: 2283, used: 3061, usedAC: 1461, usedDHK: 1600, remain: 318, pctDecl: 89, pctAC: 65, pctDHK: 108, pctForeAC: 133, pctForeDHK: 106, status: "🟢" },
  { name: "Tây Nam Bộ 1", short: "TNB1", capacity: 3544, ac: 1531, dhk: 2013, declared: 2620, declAC: 1064, declDHK: 1556, used: 2360, usedAC: 1170, usedDHK: 1190, remain: 260, pctDecl: 74, pctAC: 69, pctDHK: 77, pctForeAC: 94, pctForeDHK: 95, status: "🟢" },
  { name: "Tây Nam Bộ 2", short: "TNB2", capacity: 3922, ac: 1470, dhk: 2452, declared: 4600, declAC: 1468, declDHK: 3132, used: 2153, usedAC: 991, usedDHK: 1162, remain: 2447, pctDecl: 117, pctAC: 100, pctDHK: 128, pctForeAC: 115, pctForeDHK: 124, status: "🔴" },
];

const WAREHOUSES = [
  // Đông Tây Bắc
  { region: "Đông Tây Bắc", name: "Bắc Kạn", cap: 50, ac: 20, dhk: 30, declAC: 12, declDHK: 28, usedAC: 9, usedDHK: 2, pctDecl: 80, pctAC: 60, pctDHK: 93, foreAC: 115, foreDHK: 93, status: "🔴" },
  { region: "Đông Tây Bắc", name: "Cao Bằng", cap: 100, ac: 30, dhk: 70, declAC: 32, declDHK: 70, usedAC: 7, usedDHK: 36, pctDecl: 102, pctAC: 107, pctDHK: 100, foreAC: 60, foreDHK: 119, status: "🟢" },
  { region: "Đông Tây Bắc", name: "Điện Biên", cap: 75, ac: 25, dhk: 50, declAC: 18, declDHK: 34, usedAC: 16, usedDHK: 19, pctDecl: 69, pctAC: 72, pctDHK: 68, foreAC: 84, foreDHK: 113, status: "🔴" },
  { region: "Đông Tây Bắc", name: "Hà Giang", cap: 80, ac: 30, dhk: 50, declAC: 29, declDHK: 52, usedAC: 7, usedDHK: 20, pctDecl: 101, pctAC: 97, pctDHK: 104, foreAC: 120, foreDHK: 56, status: "🔴" },
  { region: "Đông Tây Bắc", name: "Lai Châu", cap: 40, ac: 15, dhk: 25, declAC: 12, declDHK: 30, usedAC: 15, usedDHK: 13, pctDecl: 105, pctAC: 80, pctDHK: 120, foreAC: 225, foreDHK: 45, status: "🟢" },
  { region: "Đông Tây Bắc", name: "Lạng Sơn", cap: 140, ac: 50, dhk: 90, declAC: 41, declDHK: 92, usedAC: 29, usedDHK: 51, pctDecl: 95, pctAC: 82, pctDHK: 102, foreAC: 99, foreDHK: 39, status: "🟢" },
  { region: "Đông Tây Bắc", name: "Lào Cai", cap: 110, ac: 45, dhk: 65, declAC: 35, declDHK: 65, usedAC: 29, usedDHK: 41, pctDecl: 91, pctAC: 78, pctDHK: 100, foreAC: 102, foreDHK: 100, status: "🟡" },
  { region: "Đông Tây Bắc", name: "Vĩnh Phúc (Xuân Lãng)", cap: 190, ac: 90, dhk: 100, declAC: 100, declDHK: 160, usedAC: 50, usedDHK: 94, pctDecl: 137, pctAC: 111, pctDHK: 160, foreAC: 103, foreDHK: 85, status: "🟢" },
  { region: "Đông Tây Bắc", name: "Phú Thọ", cap: 240, ac: 90, dhk: 150, declAC: 74, declDHK: 155, usedAC: 44, usedDHK: 81, pctDecl: 95, pctAC: 82, pctDHK: 103, foreAC: 94, foreDHK: 83, status: "🟢" },
  { region: "Đông Tây Bắc", name: "Sơn La", cap: 120, ac: 40, dhk: 80, declAC: 27, declDHK: 83, usedAC: 21, usedDHK: 51, pctDecl: 92, pctAC: 68, pctDHK: 104, foreAC: 107, foreDHK: 70, status: "🟡" },
  { region: "Đông Tây Bắc", name: "Thái Nguyên", cap: 210, ac: 80, dhk: 130, declAC: 85, declDHK: 130, usedAC: 31, usedDHK: 74, pctDecl: 102, pctAC: 106, pctDHK: 100, foreAC: 145, foreDHK: 91, status: "🟢" },
  { region: "Đông Tây Bắc", name: "Tuyên Quang", cap: 120, ac: 50, dhk: 70, declAC: 32, declDHK: 73, usedAC: 8, usedDHK: 26, pctDecl: 88, pctAC: 64, pctDHK: 104, foreAC: 114, foreDHK: 120, status: "🟢" },
  { region: "Đông Tây Bắc", name: "Yên Bái", cap: 125, ac: 45, dhk: 80, declAC: 42, declDHK: 82, usedAC: 19, usedDHK: 36, pctDecl: 99, pctAC: 93, pctDHK: 103, foreAC: 101, foreDHK: 83, status: "🟢" },
  // ĐBSH
  { region: "ĐBSH", name: "Bắc Giang", cap: 230, ac: 80, dhk: 150, declAC: 78, declDHK: 148, usedAC: 60, usedDHK: 66, pctDecl: 98, pctAC: 98, pctDHK: 99, foreAC: 138, foreDHK: 103, status: "🟢" },
  { region: "ĐBSH", name: "Bắc Ninh (Tiên Du)", cap: 295, ac: 125, dhk: 170, declAC: 114, declDHK: 170, usedAC: 126, usedDHK: 209, pctDecl: 96, pctAC: 91, pctDHK: 100, foreAC: 107, foreDHK: 94, status: "🟢" },
  { region: "ĐBSH", name: "Hải Dương (Gia Lộc)", cap: 196, ac: 76, dhk: 120, declAC: 71, declDHK: 120, usedAC: 31, usedDHK: 76, pctDecl: 97, pctAC: 93, pctDHK: 100, foreAC: 143, foreDHK: 68, status: "🟢" },
  { region: "ĐBSH", name: "Hải Phòng (An Lão)", cap: 155, ac: 75, dhk: 80, declAC: 67, declDHK: 80, usedAC: 38, usedDHK: 57, pctDecl: 95, pctAC: 89, pctDHK: 100, foreAC: 139, foreDHK: 119, status: "🟢" },
  { region: "ĐBSH", name: "Hải Phòng (Vĩnh Niệm)", cap: 320, ac: 150, dhk: 170, declAC: 143, declDHK: 173, usedAC: 138, usedDHK: 267, pctDecl: 99, pctAC: 95, pctDHK: 102, foreAC: 105, foreDHK: 83, status: "🟢" },
  { region: "ĐBSH", name: "Hưng Yên", cap: 146, ac: 79, dhk: 67, declAC: 55, declDHK: 33, usedAC: 36, usedDHK: 34, pctDecl: 60, pctAC: 69, pctDHK: 49, foreAC: 480, foreDHK: 121, status: "🟢" },
  { region: "ĐBSH", name: "Quảng Ninh (Hạ Long)", cap: 105, ac: 45, dhk: 60, declAC: 48, declDHK: 52, usedAC: 6, usedDHK: 34, pctDecl: 95, pctAC: 107, pctDHK: 87, foreAC: 186, foreDHK: 196, status: "🟡" },
  { region: "ĐBSH", name: "Quảng Ninh (Mạo Khê)", cap: 100, ac: 50, dhk: 50, declAC: 48, declDHK: 60, usedAC: 8, usedDHK: 23, pctDecl: 108, pctAC: 96, pctDHK: 120, foreAC: 143, foreDHK: 101, status: "🟢" },
  { region: "ĐBSH", name: "Quảng Ninh (Cẩm Phả)", cap: 110, ac: 50, dhk: 60, declAC: 35, declDHK: 62, usedAC: 19, usedDHK: 34, pctDecl: 88, pctAC: 70, pctDHK: 103, foreAC: 141, foreDHK: 71, status: "🟢" },
  { region: "ĐBSH", name: "Thái Bình (Đông Hưng)", cap: 297, ac: 117, dhk: 180, declAC: 106, declDHK: 181, usedAC: 61, usedDHK: 69, pctDecl: 97, pctAC: 91, pctDHK: 101, foreAC: 150, foreDHK: 116, status: "🟢" },
  // Hà Nội+
  { region: "Hà Nội+", name: "Phủ Lý (Hà Nam)", cap: 115, ac: 55, dhk: 60, declAC: 51, declDHK: 74, usedAC: 32, usedDHK: 48, pctDecl: 109, pctAC: 93, pctDHK: 123, foreAC: 236, foreDHK: 132, status: "🟢" },
  { region: "Hà Nội+", name: "Hoài Đức", cap: 215, ac: 85, dhk: 130, declAC: 73, declDHK: 141, usedAC: 39, usedDHK: 116, pctDecl: 100, pctAC: 86, pctDHK: 108, foreAC: 315, foreDHK: 90, status: "🔴" },
  { region: "Hà Nội+", name: "Sơn Tây", cap: 95, ac: 35, dhk: 60, declAC: 35, declDHK: 72, usedAC: 10, usedDHK: 46, pctDecl: 113, pctAC: 100, pctDHK: 120, foreAC: 140, foreDHK: 64, status: "🔴" },
  { region: "Hà Nội+", name: "Chương Mỹ", cap: 105, ac: 50, dhk: 55, declAC: 50, declDHK: 72, usedAC: 30, usedDHK: 32, pctDecl: 116, pctAC: 100, pctDHK: 131, foreAC: 113, foreDHK: 90, status: "🔴" },
  { region: "Hà Nội+", name: "Thường Tín", cap: 160, ac: 80, dhk: 80, declAC: 50, declDHK: 121, usedAC: 37, usedDHK: 56, pctDecl: 107, pctAC: 63, pctDHK: 151, foreAC: 166, foreDHK: 51, status: "🟢" },
  { region: "Hà Nội+", name: "Tùng Giang", cap: 360, ac: 140, dhk: 220, declAC: 0, declDHK: 0, usedAC: 0, usedDHK: 0, pctDecl: 0, pctAC: 0, pctDHK: 0, foreAC: 86, foreDHK: 75, status: "🟢" },
  { region: "Hà Nội+", name: "Đông Anh", cap: 270, ac: 120, dhk: 150, declAC: 115, declDHK: 137, usedAC: 97, usedDHK: 124, pctDecl: 93, pctAC: 96, pctDHK: 91, foreAC: 95, foreDHK: 114, status: "🟡" },
  { region: "Hà Nội+", name: "Hòa Bình", cap: 140, ac: 75, dhk: 65, declAC: 62, declDHK: 106, usedAC: 17, usedDHK: 29, pctDecl: 120, pctAC: 83, pctDHK: 163, foreAC: 423, foreDHK: 123, status: "🟢" },
  { region: "Hà Nội+", name: "Văn Lâm (HY)", cap: 150, ac: 50, dhk: 100, declAC: 46, declDHK: 33, usedAC: 66, usedDHK: 85, pctDecl: 53, pctAC: 92, pctDHK: 33, foreAC: 142, foreDHK: 85, status: "🔴" },
  { region: "Hà Nội+", name: "Nam Định 2025", cap: 140, ac: 60, dhk: 80, declAC: 60, declDHK: 90, usedAC: 16, usedDHK: 35, pctDecl: 107, pctAC: 100, pctDHK: 113, foreAC: 251, foreDHK: 91, status: "🔴" },
  { region: "Hà Nội+", name: "Hải Hậu", cap: 140, ac: 70, dhk: 70, declAC: 47, declDHK: 106, usedAC: 46, usedDHK: 54, pctDecl: 109, pctAC: 67, pctDHK: 151, foreAC: 144, foreDHK: 44, status: "🔴" },
  { region: "Hà Nội+", name: "Hoàng Mai (NA)", cap: 226, ac: 96, dhk: 130, declAC: 75, declDHK: 167, usedAC: 26, usedDHK: 56, pctDecl: 107, pctAC: 78, pctDHK: 128, foreAC: 100, foreDHK: 100, status: "🔴" },
  { region: "Hà Nội+", name: "Vinh", cap: 125, ac: 55, dhk: 70, declAC: 60, declDHK: 111, usedAC: 15, usedDHK: 47, pctDecl: 137, pctAC: 109, pctDHK: 159, foreAC: 133, foreDHK: 117, status: "🔴" },
  { region: "Hà Nội+", name: "Thanh Chương", cap: 165, ac: 55, dhk: 110, declAC: 51, declDHK: 165, usedAC: 12, usedDHK: 50, pctDecl: 131, pctAC: 93, pctDHK: 150, foreAC: 164, foreDHK: 100, status: "🔴" },
  { region: "Hà Nội+", name: "Ninh Bình", cap: 170, ac: 70, dhk: 100, declAC: 70, declDHK: 215, usedAC: 33, usedDHK: 99, pctDecl: 168, pctAC: 100, pctDHK: 215, foreAC: 143, foreDHK: 72, status: "🔴" },
  { region: "Hà Nội+", name: "Bỉm Sơn", cap: 137, ac: 57, dhk: 80, declAC: 60, declDHK: 90, usedAC: 33, usedDHK: 75, pctDecl: 109, pctAC: 105, pctDHK: 113, foreAC: 208, foreDHK: 197, status: "🔴" },
  { region: "Hà Nội+", name: "Thọ Xuân", cap: 100, ac: 40, dhk: 60, declAC: 35, declDHK: 87, usedAC: 11, usedDHK: 33, pctDecl: 122, pctAC: 88, pctDHK: 145, foreAC: 212, foreDHK: 86, status: "🔴" },
  { region: "Hà Nội+", name: "Thanh Hóa 2025", cap: 244, ac: 124, dhk: 120, declAC: 117, declDHK: 169, usedAC: 31, usedDHK: 92, pctDecl: 117, pctAC: 94, pctDHK: 141, foreAC: 107, foreDHK: 54, status: "🔴" },
  // Trung Bộ
  { region: "Trung Bộ", name: "Cẩm Lệ (ĐN)", cap: 380, ac: 107, dhk: 273, declAC: 100, declDHK: 276, usedAC: 34, usedDHK: 154, pctDecl: 99, pctAC: 93, pctDHK: 101, foreAC: 139, foreDHK: 183, status: "🟢" },
  { region: "Trung Bộ", name: "Liên Chiểu (ĐN)", cap: 295, ac: 93, dhk: 202, declAC: 89, declDHK: 200, usedAC: 50, usedDHK: 124, pctDecl: 98, pctAC: 96, pctDHK: 99, foreAC: 151, foreDHK: 149, status: "🟡" },
  { region: "Trung Bộ", name: "Hà Tĩnh", cap: 297, ac: 95, dhk: 202, declAC: 102, declDHK: 273, usedAC: 58, usedDHK: 109, pctDecl: 126, pctAC: 107, pctDHK: 135, foreAC: 161, foreDHK: 80, status: "🟢" },
  { region: "Trung Bộ", name: "Đồng Hới (QB)", cap: 242, ac: 121, dhk: 121, declAC: 42, declDHK: 87, usedAC: 39, usedDHK: 46, pctDecl: 53, pctAC: 35, pctDHK: 72, foreAC: 169, foreDHK: 97, status: "🟢" },
  { region: "Trung Bộ", name: "Tam Kỳ (QN)", cap: 327, ac: 104, dhk: 223, declAC: 99, declDHK: 224, usedAC: 39, usedDHK: 133, pctDecl: 99, pctAC: 95, pctDHK: 100, foreAC: 88, foreDHK: 159, status: "🟢" },
  { region: "Trung Bộ", name: "Điện Bàn (QN)", cap: 370, ac: 107, dhk: 263, declAC: 100, declDHK: 267, usedAC: 44, usedDHK: 177, pctDecl: 99, pctAC: 93, pctDHK: 102, foreAC: 196, foreDHK: 232, status: "🔴" },
  { region: "Trung Bộ", name: "Sơn Tịnh (QNG)", cap: 402, ac: 160, dhk: 242, declAC: 117, declDHK: 337, usedAC: 56, usedDHK: 111, pctDecl: 113, pctAC: 73, pctDHK: 139, foreAC: 129, foreDHK: 94, status: "🔴" },
  { region: "Trung Bộ", name: "Đông Hà (QT)", cap: 241, ac: 113, dhk: 128, declAC: 82, declDHK: 198, usedAC: 44, usedDHK: 61, pctDecl: 116, pctAC: 73, pctDHK: 155, foreAC: 149, foreDHK: 99, status: "🟢" },
  { region: "Trung Bộ", name: "An Hòa (Huế)", cap: 411, ac: 96, dhk: 315, declAC: 91, declDHK: 319, usedAC: 37, usedDHK: 68, pctDecl: 100, pctAC: 95, pctDHK: 101, foreAC: 96, foreDHK: 223, status: "🔴" },
  { region: "Trung Bộ", name: "Hương Thủy (Huế)", cap: 258, ac: 118, dhk: 140, declAC: 71, declDHK: 238, usedAC: 13, usedDHK: 90, pctDecl: 120, pctAC: 60, pctDHK: 170, foreAC: 150, foreDHK: 109, status: "🟢" },
  // Duyên Hải
  { region: "Duyên Hải", name: "Phú Mỹ (BR-VT)", cap: 150, ac: 80, dhk: 70, declAC: 70, declDHK: 70, usedAC: 78, usedDHK: 83, pctDecl: 93, pctAC: 88, pctDHK: 100, foreAC: 143, foreDHK: 77, status: "🟢" },
  { region: "Duyên Hải", name: "Bà Rịa", cap: 320, ac: 145, dhk: 175, declAC: 139, declDHK: 162, usedAC: 170, usedDHK: 168, pctDecl: 94, pctAC: 96, pctDHK: 93, foreAC: 73, foreDHK: 130, status: "🟢" },
  { region: "Duyên Hải", name: "Vũng Tàu", cap: 180, ac: 90, dhk: 90, declAC: 80, declDHK: 91, usedAC: 90, usedDHK: 60, pctDecl: 95, pctAC: 89, pctDHK: 101, foreAC: 94, foreDHK: 85, status: "🟢" },
  { region: "Duyên Hải", name: "Phù Cát (BĐ)", cap: 200, ac: 80, dhk: 120, declAC: 0, declDHK: 0, usedAC: 0, usedDHK: 0, pctDecl: 0, pctAC: 0, pctDHK: 0, foreAC: 93, foreDHK: 114, status: "🟢" },
  { region: "Duyên Hải", name: "Hoài Nhơn (BĐ)", cap: 140, ac: 60, dhk: 80, declAC: 40, declDHK: 75, usedAC: 11, usedDHK: 27, pctDecl: 82, pctAC: 67, pctDHK: 94, foreAC: 123, foreDHK: 76, status: "🔴" },
  { region: "Duyên Hải", name: "Quy Nhơn 2025", cap: 180, ac: 100, dhk: 80, declAC: 85, declDHK: 124, usedAC: 68, usedDHK: 85, pctDecl: 116, pctAC: 85, pctDHK: 155, foreAC: 100, foreDHK: 59, status: "🟢" },
  { region: "Duyên Hải", name: "Tuy Phong (BT)", cap: 130, ac: 50, dhk: 80, declAC: 46, declDHK: 60, usedAC: 37, usedDHK: 49, pctDecl: 82, pctAC: 92, pctDHK: 75, foreAC: 65, foreDHK: 155, status: "🔴" },
  { region: "Duyên Hải", name: "La Gi (BT)", cap: 90, ac: 40, dhk: 50, declAC: 40, declDHK: 60, usedAC: 18, usedDHK: 57, pctDecl: 111, pctAC: 100, pctDHK: 120, foreAC: 61, foreDHK: 97, status: "🟢" },
  { region: "Duyên Hải", name: "Hàm Thuận Bắc", cap: 180, ac: 80, dhk: 100, declAC: 75, declDHK: 90, usedAC: 69, usedDHK: 69, pctDecl: 92, pctAC: 94, pctDHK: 90, foreAC: 82, foreDHK: 141, status: "🟢" },
  { region: "Duyên Hải", name: "Đức Linh (BT)", cap: 90, ac: 45, dhk: 45, declAC: 36, declDHK: 52, usedAC: 16, usedDHK: 24, pctDecl: 98, pctAC: 80, pctDHK: 116, foreAC: 120, foreDHK: 128, status: "🟡" },
  { region: "Duyên Hải", name: "Diên Khánh (KH)", cap: 380, ac: 170, dhk: 210, declAC: 172, declDHK: 233, usedAC: 201, usedDHK: 189, pctDecl: 107, pctAC: 101, pctDHK: 111, foreAC: 70, foreDHK: 83, status: "🔴" },
  { region: "Duyên Hải", name: "Phan Rang (NT)", cap: 230, ac: 80, dhk: 150, declAC: 103, declDHK: 135, usedAC: 99, usedDHK: 132, pctDecl: 103, pctAC: 129, pctDHK: 90, foreAC: 56, foreDHK: 152, status: "🟢" },
  { region: "Duyên Hải", name: "Tuy Hòa (PY)", cap: 250, ac: 100, dhk: 150, declAC: 84, declDHK: 110, usedAC: 58, usedDHK: 70, pctDecl: 78, pctAC: 84, pctDHK: 73, foreAC: 99, foreDHK: 142, status: "🟢" },
  // ĐCN
  { region: "Đông Cao Nguyên", name: "Thuận An (BĐ)", cap: 650, ac: 300, dhk: 350, declAC: 358, declDHK: 520, usedAC: 461, usedDHK: 477, pctDecl: 135, pctAC: 119, pctDHK: 149, foreAC: 98, foreDHK: 110, status: "🟢" },
  { region: "Đông Cao Nguyên", name: "Bến Cát (BĐ)", cap: 730, ac: 340, dhk: 390, declAC: 267, declDHK: 305, usedAC: 403, usedDHK: 327, pctDecl: 78, pctAC: 79, pctDHK: 78, foreAC: 138, foreDHK: 130, status: "🟢" },
  { region: "Đông Cao Nguyên", name: "Đồng Xoài (BP)", cap: 450, ac: 190, dhk: 260, declAC: 155, declDHK: 218, usedAC: 179, usedDHK: 169, pctDecl: 83, pctAC: 82, pctDHK: 84, foreAC: 177, foreDHK: 92, status: "🔴" },
  { region: "Đông Cao Nguyên", name: "Buôn Mê Thuột", cap: 555, ac: 275, dhk: 280, declAC: 180, declDHK: 438, usedAC: 35, usedDHK: 149, pctDecl: 111, pctAC: 65, pctDHK: 156, foreAC: 273, foreDHK: 81, status: "🟢" },
  { region: "Đông Cao Nguyên", name: "Nhân Cơ (ĐN)", cap: 180, ac: 50, dhk: 130, declAC: 41, declDHK: 131, usedAC: 33, usedDHK: 94, pctDecl: 96, pctAC: 82, pctDHK: 101, foreAC: 262, foreDHK: 111, status: "🟢" },
  { region: "Đông Cao Nguyên", name: "Long Thành (ĐN)", cap: 340, ac: 160, dhk: 180, declAC: 80, declDHK: 170, usedAC: 171, usedDHK: 162, pctDecl: 74, pctAC: 50, pctDHK: 94, foreAC: 168, foreDHK: 120, status: "🟢" },
  { region: "Đông Cao Nguyên", name: "Xuân Lộc (ĐN)", cap: 360, ac: 120, dhk: 240, declAC: 115, declDHK: 205, usedAC: 152, usedDHK: 165, pctDecl: 89, pctAC: 96, pctDHK: 85, foreAC: 157, foreDHK: 131, status: "🟢" },
  { region: "Đông Cao Nguyên", name: "Biên Hòa", cap: 620, ac: 250, dhk: 370, declAC: 190, declDHK: 280, usedAC: 319, usedDHK: 334, pctDecl: 76, pctAC: 76, pctDHK: 76, foreAC: 140, foreDHK: 161, status: "🔴" },
  { region: "Đông Cao Nguyên", name: "Pleiku (GL)", cap: 505, ac: 185, dhk: 320, declAC: 97, declDHK: 422, usedAC: 41, usedDHK: 164, pctDecl: 103, pctAC: 52, pctDHK: 132, foreAC: 214, foreDHK: 100, status: "🔴" },
  { region: "Đông Cao Nguyên", name: "Đức Trọng (LĐ)", cap: 400, ac: 70, dhk: 330, declAC: 64, declDHK: 477, usedAC: 67, usedDHK: 257, pctDecl: 135, pctAC: 91, pctDHK: 145, foreAC: 152, foreDHK: 122, status: "🟢" },
  { region: "Đông Cao Nguyên", name: "Tây Ninh", cap: 560, ac: 260, dhk: 300, declAC: 210, declDHK: 270, usedAC: 293, usedDHK: 261, pctDecl: 86, pctAC: 81, pctDHK: 90, foreAC: 123, foreDHK: 98, status: "🟢" },
  // HCM
  { region: "Hồ Chí Minh", name: "Thủ Đức BĐ", cap: 296, ac: 136, dhk: 160, declAC: 0, declDHK: 0, usedAC: 0, usedDHK: 0, pctDecl: 0, pctAC: 0, pctDHK: 0, foreAC: 146, foreDHK: 111, status: "🔴" },
  { region: "Hồ Chí Minh", name: "Dương Đình Hội", cap: 300, ac: 160, dhk: 140, declAC: 105, declDHK: 275, usedAC: 203, usedDHK: 136, pctDecl: 127, pctAC: 66, pctDHK: 196, foreAC: 150, foreDHK: 82, status: "🔴" },
  { region: "Hồ Chí Minh", name: "Củ Chi", cap: 255, ac: 105, dhk: 150, declAC: 94, declDHK: 170, usedAC: 116, usedDHK: 85, pctDecl: 104, pctAC: 90, pctDHK: 113, foreAC: 110, foreDHK: 118, status: "🟢" },
  { region: "Hồ Chí Minh", name: "Quận 12", cap: 595, ac: 215, dhk: 380, declAC: 175, declDHK: 340, usedAC: 233, usedDHK: 243, pctDecl: 87, pctAC: 81, pctDHK: 89, foreAC: 113, foreDHK: 106, status: "🟢" },
  { region: "Hồ Chí Minh", name: "Tân Bình", cap: 800, ac: 340, dhk: 460, declAC: 289, declDHK: 480, usedAC: 321, usedDHK: 370, pctDecl: 96, pctAC: 85, pctDHK: 104, foreAC: 130, foreDHK: 113, status: "🟡" },
  { region: "Hồ Chí Minh", name: "Bình Chánh", cap: 575, ac: 285, dhk: 290, declAC: 144, declDHK: 475, usedAC: 173, usedDHK: 329, pctDecl: 108, pctAC: 51, pctDHK: 164, foreAC: 154, foreDHK: 101, status: "🟢" },
  { region: "Hồ Chí Minh", name: "Thủ Đức HCM", cap: 341, ac: 161, dhk: 180, declAC: 80, declDHK: 125, usedAC: 152, usedDHK: 135, pctDecl: 60, pctAC: 50, pctDHK: 69, foreAC: 138, foreDHK: 112, status: "🔴" },
  { region: "Hồ Chí Minh", name: "Bến Nghé", cap: 440, ac: 190, dhk: 250, declAC: 140, declDHK: 360, usedAC: 166, usedDHK: 237, pctDecl: 114, pctAC: 74, pctDHK: 144, foreAC: 112, foreDHK: 109, status: "🟢" },
  { region: "Hồ Chí Minh", name: "Nhà Bè", cap: 195, ac: 95, dhk: 100, declAC: 69, declDHK: 58, usedAC: 97, usedDHK: 65, pctDecl: 65, pctAC: 73, pctDHK: 58, foreAC: 218, foreDHK: 97, status: "🟢" },
  // TNB1
  { region: "Tây Nam Bộ 1", name: "Bến Tre 2026", cap: 426, ac: 170, dhk: 256, declAC: 20, declDHK: 37, usedAC: 11, usedDHK: 27, pctDecl: 13, pctAC: 12, pctDHK: 14, foreAC: 60, foreDHK: 66, status: "🟢" },
  { region: "Tây Nam Bộ 1", name: "Cao Lãnh 2026", cap: 534, ac: 268, dhk: 266, declAC: 132, declDHK: 184, usedAC: 168, usedDHK: 158, pctDecl: 59, pctAC: 49, pctDHK: 69, foreAC: 74, foreDHK: 73, status: "🔴" },
  { region: "Tây Nam Bộ 1", name: "Tân An 2026", cap: 255, ac: 115, dhk: 140, declAC: 110, declDHK: 147, usedAC: 115, usedDHK: 117, pctDecl: 101, pctAC: 96, pctDHK: 105, foreAC: 149, foreDHK: 123, status: "🟢" },
  { region: "Tây Nam Bộ 1", name: "Đức Hòa", cap: 357, ac: 170, dhk: 187, declAC: 135, declDHK: 155, usedAC: 179, usedDHK: 167, pctDecl: 81, pctAC: 79, pctDHK: 83, foreAC: 162, foreDHK: 132, status: "🟢" },
  { region: "Tây Nam Bộ 1", name: "Bến Lức", cap: 350, ac: 170, dhk: 180, declAC: 155, declDHK: 184, usedAC: 141, usedDHK: 168, pctDecl: 97, pctAC: 91, pctDHK: 102, foreAC: 155, foreDHK: 119, status: "🟡" },
  { region: "Tây Nam Bộ 1", name: "Gò Công", cap: 202, ac: 70, dhk: 132, declAC: 73, declDHK: 156, usedAC: 80, usedDHK: 59, pctDecl: 113, pctAC: 104, pctDHK: 118, foreAC: 68, foreDHK: 124, status: "🔴" },
  { region: "Tây Nam Bộ 1", name: "Mỹ Tho", cap: 239, ac: 83, dhk: 156, declAC: 85, declDHK: 161, usedAC: 80, usedDHK: 122, pctDecl: 103, pctAC: 102, pctDHK: 103, foreAC: 90, foreDHK: 107, status: "🟢" },
  { region: "Tây Nam Bộ 1", name: "Cai Lậy", cap: 473, ac: 187, dhk: 286, declAC: 163, declDHK: 246, usedAC: 195, usedDHK: 177, pctDecl: 86, pctAC: 87, pctDHK: 86, foreAC: 92, foreDHK: 112, status: "🟢" },
  { region: "Tây Nam Bộ 1", name: "Trà Vinh 2026", cap: 328, ac: 120, dhk: 208, declAC: 34, declDHK: 61, usedAC: 16, usedDHK: 46, pctDecl: 29, pctAC: 28, pctDHK: 29, foreAC: 105, foreDHK: 169, status: "🔴" },
  { region: "Tây Nam Bộ 1", name: "Bình Minh (VL)", cap: 131, ac: 70, dhk: 61, declAC: 55, declDHK: 78, usedAC: 67, usedDHK: 71, pctDecl: 102, pctAC: 79, pctDHK: 128, foreAC: 101, foreDHK: 45, status: "🟢" },
  { region: "Tây Nam Bộ 1", name: "Long Hồ 2025", cap: 249, ac: 108, dhk: 141, declAC: 102, declDHK: 147, usedAC: 118, usedDHK: 78, pctDecl: 100, pctAC: 94, pctDHK: 104, foreAC: 94, foreDHK: 68, status: "🔴" },
  // TNB2
  { region: "Tây Nam Bộ 2", name: "Châu Đốc (AG)", cap: 471, ac: 175, dhk: 296, declAC: 174, declDHK: 432, usedAC: 98, usedDHK: 136, pctDecl: 129, pctAC: 99, pctDHK: 146, foreAC: 136, foreDHK: 144, status: "🟢" },
  { region: "Tây Nam Bộ 2", name: "Long Xuyên 2 (AG)", cap: 535, ac: 196, dhk: 339, declAC: 171, declDHK: 332, usedAC: 139, usedDHK: 182, pctDecl: 94, pctAC: 87, pctDHK: 98, foreAC: 120, foreDHK: 133, status: "🟡" },
  { region: "Tây Nam Bộ 2", name: "Vĩnh Lợi (BL)", cap: 340, ac: 147, dhk: 193, declAC: 176, declDHK: 374, usedAC: 80, usedDHK: 120, pctDecl: 162, pctAC: 120, pctDHK: 194, foreAC: 139, foreDHK: 102, status: "🔴" },
  { region: "Tây Nam Bộ 2", name: "Cà Mau", cap: 522, ac: 142, dhk: 380, declAC: 202, declDHK: 435, usedAC: 51, usedDHK: 117, pctDecl: 122, pctAC: 142, pctDHK: 114, foreAC: 114, foreDHK: 189, status: "🟢" },
  { region: "Tây Nam Bộ 2", name: "Cái Răng (CT)", cap: 334, ac: 164, dhk: 170, declAC: 105, declDHK: 136, usedAC: 156, usedDHK: 137, pctDecl: 72, pctAC: 64, pctDHK: 80, foreAC: 306, foreDHK: 103, status: "🔴" },
  { region: "Tây Nam Bộ 2", name: "Thốt Nốt (CT)", cap: 205, ac: 71, dhk: 134, declAC: 77, declDHK: 197, usedAC: 73, usedDHK: 72, pctDecl: 134, pctAC: 108, pctDHK: 147, foreAC: 119, foreDHK: 101, status: "🔴" },
  { region: "Tây Nam Bộ 2", name: "Châu Thành A (HG)", cap: 370, ac: 111, dhk: 259, declAC: 150, declDHK: 333, usedAC: 150, usedDHK: 120, pctDecl: 131, pctAC: 135, pctDHK: 129, foreAC: 75, foreDHK: 114, status: "🔴" },
  { region: "Tây Nam Bộ 2", name: "Rạch Giá (KG)", cap: 519, ac: 238, dhk: 281, declAC: 258, declDHK: 550, usedAC: 174, usedDHK: 194, pctDecl: 156, pctAC: 108, pctDHK: 196, foreAC: 114, foreDHK: 89, status: "🔴" },
  { region: "Tây Nam Bộ 2", name: "Giồng Riềng (KG)", cap: 238, ac: 100, dhk: 138, declAC: 93, declDHK: 213, usedAC: 44, usedDHK: 47, pctDecl: 129, pctAC: 93, pctDHK: 154, foreAC: 152, foreDHK: 132, status: "🟢" },
  { region: "Tây Nam Bộ 2", name: "Sóc Trăng 2026", cap: 388, ac: 126, dhk: 262, declAC: 62, declDHK: 130, usedAC: 26, usedDHK: 37, pctDecl: 49, pctAC: 49, pctDHK: 50, foreAC: 58, foreDHK: 146, status: "🟢" },
];

const statusColor = { "🔴": "#ef4444", "🟡": "#f59e0b", "🟢": "#22c55e" };
const statusLabel = { "🔴": "Quá tải", "🟡": "Cảnh báo", "🟢": "Bình thường" };
const statusBg = { "🔴": "#fef2f2", "🟡": "#fffbeb", "🟢": "#f0fdf4" };
const statusBorder = { "🔴": "#fecaca", "🟡": "#fde68a", "🟢": "#bbf7d0" };

const countByStatus = (list) => ({
  red: list.filter(w => w.status === "🔴").length,
  yellow: list.filter(w => w.status === "🟡").length,
  green: list.filter(w => w.status === "🟢").length,
});

export default function Dashboard() {
  const [tab, setTab] = useState("overview");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sortCol, setSortCol] = useState("pctDecl");
  const [sortAsc, setSortAsc] = useState(false);

  const wStats = countByStatus(WAREHOUSES);
  const totalCap = REGIONS.reduce((s, r) => s + r.capacity, 0);
  const totalDecl = REGIONS.reduce((s, r) => s + r.declared, 0);
  const totalUsed = REGIONS.reduce((s, r) => s + r.used, 0);

  const criticalWarehouses = WAREHOUSES
    .filter(w => w.status === "🔴")
    .sort((a, b) => b.pctDecl - a.pctDecl)
    .slice(0, 10);

  const regionChartData = REGIONS.map(r => ({
    name: r.short,
    "Năng lực": r.capacity,
    "Khai báo": r.declared,
    "Đã sử dụng": r.used,
    pct: r.pctDecl,
    status: r.status,
  }));

  const pieData = [
    { name: "Quá tải 🔴", value: wStats.red, color: "#ef4444" },
    { name: "Cảnh báo 🟡", value: wStats.yellow, color: "#f59e0b" },
    { name: "Bình thường 🟢", value: wStats.green, color: "#22c55e" },
  ];

  const filteredWH = selectedRegion
    ? WAREHOUSES.filter(w => w.region === selectedRegion)
    : WAREHOUSES;

  const sortedWH = [...filteredWH].sort((a, b) => {
    const va = a[sortCol] ?? 0;
    const vb = b[sortCol] ?? 0;
    return sortAsc ? va - vb : vb - va;
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(!sortAsc);
    else { setSortCol(col); setSortAsc(false); }
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (!active || !payload) return null;
    return (
      <div style={{ background: "#1e293b", color: "#f8fafc", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>{p.name}: <b>{p.value?.toLocaleString()}</b></div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif", background: "#0f172a", minHeight: "100vh", color: "#e2e8f0", padding: "0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #1e293b 100%)", borderBottom: "1px solid #334155", padding: "20px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ background: "#3b82f6", borderRadius: 10, padding: "8px 12px", fontSize: 22 }}>📦</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
              PHÂN TÍCH TẢI KHO — THỢ ĐMX
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Cập nhật: 19/05/2026 · {WAREHOUSES.length} kho · {REGIONS.length} vùng</div>
          </div>
        </div>

        {/* KPI Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 20 }}>
          {[
            { label: "Tổng năng lực", val: totalCap.toLocaleString(), sub: "đơn vị", color: "#60a5fa" },
            { label: "Khai báo HT", val: totalDecl.toLocaleString(), sub: `${Math.round(totalDecl/totalCap*100)}% năng lực`, color: totalDecl/totalCap > 1 ? "#f87171" : "#34d399" },
            { label: "Đã sử dụng", val: totalUsed.toLocaleString(), sub: `${Math.round(totalUsed/totalCap*100)}% năng lực`, color: "#a78bfa" },
            { label: "Kho quá tải 🔴", val: wStats.red, sub: `/ ${WAREHOUSES.length} kho`, color: "#f87171" },
          ].map((k, i) => (
            <div key={i} style={{ background: "#1e293b", borderRadius: 10, padding: "14px 16px", border: "1px solid #334155" }}>
              <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: k.color, lineHeight: 1.2, marginTop: 4 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #334155", background: "#1e293b", padding: "0 28px" }}>
        {[["overview", "📊 Tổng quan Vùng"], ["warehouses", "🏭 Danh sách Kho"], ["alerts", "🚨 Cảnh báo"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{
            background: "none", border: "none", color: tab === id ? "#60a5fa" : "#64748b",
            borderBottom: tab === id ? "2px solid #60a5fa" : "2px solid transparent",
            padding: "12px 18px", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 400, transition: "all .15s"
          }}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "24px 28px" }}>

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <div>
            {/* Pie + Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, marginBottom: 24 }}>
              <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 16, fontSize: 14 }}>Phân bố trạng thái kho</div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                      {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v + " kho", n]} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
                  {[["🔴", wStats.red, "#ef4444"], ["🟡", wStats.yellow, "#f59e0b"], ["🟢", wStats.green, "#22c55e"]].map(([e, v, c]) => (
                    <div key={e} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{v}</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>kho {e}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 16, fontSize: 14 }}>Khai báo HT / Năng lực theo Vùng (%)</div>
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={REGIONS.map(r => ({ name: r.short, pct: r.pctDecl, status: r.status }))} barSize={28}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 140]} unit="%" />
                    <Tooltip formatter={(v) => [v + "%", "% Khai báo"]} contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {REGIONS.map((r, i) => (
                        <Cell key={i} fill={r.pctDecl > 100 ? "#ef4444" : r.pctDecl >= 90 ? "#f59e0b" : "#22c55e"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Region Cards */}
            <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 12, fontSize: 14 }}>Chi tiết theo Vùng</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {REGIONS.map((r, i) => {
                const whInRegion = WAREHOUSES.filter(w => w.region === r.name);
                const wSt = countByStatus(whInRegion);
                return (
                  <div key={i} style={{ background: "#1e293b", borderRadius: 12, padding: 16, border: `1px solid ${r.status === "🔴" ? "#ef444480" : r.status === "🟡" ? "#f59e0b80" : "#334155"}`, cursor: "pointer", transition: "transform .15s" }}
                    onClick={() => { setSelectedRegion(r.name); setTab("warehouses"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>NL: {r.capacity.toLocaleString()} · {whInRegion.length} kho</div>
                      </div>
                      <div style={{ fontSize: 20 }}>{r.status}</div>
                    </div>
                    {/* Progress bar */}
                    <div style={{ marginTop: 10, marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                        <span>Khai báo/NL</span><span style={{ fontWeight: 700, color: r.pctDecl > 100 ? "#f87171" : r.pctDecl >= 90 ? "#fbbf24" : "#4ade80" }}>{r.pctDecl}%</span>
                      </div>
                      <div style={{ background: "#334155", borderRadius: 4, height: 6 }}>
                        <div style={{ width: `${Math.min(r.pctDecl, 140)}%`, background: r.pctDecl > 100 ? "#ef4444" : r.pctDecl >= 90 ? "#f59e0b" : "#22c55e", height: 6, borderRadius: 4 }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      {[["ML", r.pctAC], ["ĐHK", r.pctDHK]].map(([lbl, pct]) => (
                        <div key={lbl} style={{ flex: 1, background: "#0f172a", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                          <div style={{ fontSize: 10, color: "#64748b" }}>{lbl}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: pct > 100 ? "#f87171" : pct >= 90 ? "#fbbf24" : "#4ade80" }}>{pct}%</div>
                        </div>
                      ))}
                      <div style={{ flex: 1, background: "#0f172a", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#64748b" }}>🔴 kho</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: wSt.red > 0 ? "#f87171" : "#4ade80" }}>{wSt.red}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WAREHOUSES TAB */}
        {tab === "warehouses" && (
          <div>
            <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>Lọc vùng:</div>
              <button onClick={() => setSelectedRegion(null)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, background: !selectedRegion ? "#3b82f6" : "#334155", color: "#f1f5f9" }}>Tất cả</button>
              {REGIONS.map(r => (
                <button key={r.name} onClick={() => setSelectedRegion(r.name)} style={{ padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, background: selectedRegion === r.name ? "#3b82f6" : "#334155", color: "#f1f5f9" }}>{r.short}</button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>Hiển thị {sortedWH.length} kho · Nhấp tiêu đề để sắp xếp</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#334155", color: "#94a3b8" }}>
                    {[["name", "Tên kho"], ["region", "Vùng"], ["cap", "NL Tổng"], ["pctDecl", "% KB/NL"], ["pctAC", "% KB ML"], ["pctDHK", "% KB ĐHK"], ["foreAC", "% NL/DBA ML"], ["foreDHK", "% NL/DBA ĐHK"], ["status", "Trạng thái"]].map(([col, label]) => (
                      <th key={col} onClick={() => handleSort(col)} style={{ padding: "8px 10px", textAlign: "left", cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" }}>
                        {label} {sortCol === col ? (sortAsc ? "↑" : "↓") : ""}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedWH.map((w, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#1e293b" : "#162032", borderBottom: "1px solid #1e293b" }}>
                      <td style={{ padding: "7px 10px", color: "#f1f5f9", fontWeight: 600 }}>{w.name}</td>
                      <td style={{ padding: "7px 10px", color: "#94a3b8", fontSize: 11 }}>{w.region}</td>
                      <td style={{ padding: "7px 10px", color: "#60a5fa" }}>{w.cap}</td>
                      <td style={{ padding: "7px 10px", fontWeight: 700, color: w.pctDecl > 100 ? "#f87171" : w.pctDecl >= 90 ? "#fbbf24" : "#4ade80" }}>{w.pctDecl}%</td>
                      <td style={{ padding: "7px 10px", color: w.pctAC > 100 ? "#f87171" : w.pctAC >= 90 ? "#fbbf24" : "#94a3b8" }}>{w.pctAC}%</td>
                      <td style={{ padding: "7px 10px", color: w.pctDHK > 100 ? "#f87171" : w.pctDHK >= 90 ? "#fbbf24" : "#94a3b8" }}>{w.pctDHK}%</td>
                      <td style={{ padding: "7px 10px", color: w.foreAC > 100 ? "#f87171" : "#94a3b8" }}>{w.foreAC}%</td>
                      <td style={{ padding: "7px 10px", color: w.foreDHK > 100 ? "#f87171" : "#94a3b8" }}>{w.foreDHK}%</td>
                      <td style={{ padding: "7px 10px" }}><span style={{ background: w.status === "🔴" ? "#450a0a" : w.status === "🟡" ? "#451a03" : "#052e16", color: w.status === "🔴" ? "#fca5a5" : w.status === "🟡" ? "#fcd34d" : "#86efac", borderRadius: 6, padding: "2px 8px", fontSize: 11 }}>{w.status} {statusLabel[w.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ALERTS TAB */}
        {tab === "alerts" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
              {/* Top critical */}
              <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, color: "#f87171", marginBottom: 14, fontSize: 14 }}>🔴 Top kho khai báo vượt năng lực cao nhất</div>
                {WAREHOUSES.filter(w => w.pctDecl > 100).sort((a, b) => b.pctDecl - a.pctDecl).slice(0, 8).map((w, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1e3a5f" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{w.region}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#f87171" }}>{w.pctDecl}%</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>KB/NL</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ĐHK high */}
              <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                <div style={{ fontWeight: 700, color: "#fbbf24", marginBottom: 14, fontSize: 14 }}>⚠️ Kho ĐHK khai báo vượt năng lực cao nhất</div>
                {WAREHOUSES.filter(w => w.pctDHK > 100).sort((a, b) => b.pctDHK - a.pctDHK).slice(0, 8).map((w, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1e3a5f" }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600 }}>{w.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{w.region} · ML: {w.pctAC}%</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#fbbf24" }}>{w.pctDHK}%</div>
                      <div style={{ fontSize: 10, color: "#64748b" }}>ĐHK/NL</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast alerts */}
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 20, border: "1px solid #334155", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: 14, fontSize: 14 }}>📈 Kho có % Dự báo Máy lạnh vượt 200% năng lực</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {WAREHOUSES.filter(w => w.foreAC > 200).sort((a, b) => b.foreAC - a.foreAC).map((w, i) => (
                  <div key={i} style={{ background: "#0f172a", borderRadius: 8, padding: "10px 14px", border: "1px solid #334155" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{w.region}</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div><span style={{ fontSize: 11, color: "#64748b" }}>DBA ML:</span> <span style={{ fontWeight: 800, color: "#a78bfa" }}>{w.foreAC}%</span></div>
                      <div><span style={{ fontSize: 11, color: "#64748b" }}>DBA ĐHK:</span> <span style={{ fontWeight: 700, color: "#94a3b8" }}>{w.foreDHK}%</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {[
                { label: "Kho khai báo vượt 100% NL (Tổng)", val: WAREHOUSES.filter(w => w.pctDecl > 100).length, color: "#f87171", icon: "🔴" },
                { label: "Kho ĐHK vượt 100% NL", val: WAREHOUSES.filter(w => w.pctDHK > 100).length, color: "#fbbf24", icon: "❄️" },
                { label: "Kho ML vượt 100% NL", val: WAREHOUSES.filter(w => w.pctAC > 100).length, color: "#60a5fa", icon: "🌡️" },
                { label: "Kho chưa khai báo (0%)", val: WAREHOUSES.filter(w => w.pctDecl === 0).length, color: "#94a3b8", icon: "⬜" },
                { label: "Vùng quá tải (>100%)", val: REGIONS.filter(r => r.pctDecl > 100).length, color: "#f87171", icon: "📍" },
                { label: "Kho dự báo ML >200%", val: WAREHOUSES.filter(w => w.foreAC > 200).length, color: "#a78bfa", icon: "📈" },
              ].map((s, i) => (
                <div key={i} style={{ background: "#1e293b", borderRadius: 10, padding: "14px 16px", border: "1px solid #334155", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
