let cheerio = require('cheerio');
let axios = require('axios');
const fs = require('fs');
const path = require('path');
const url = 'https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_ng%C6%B0%E1%BB%9Di_%C4%91o%E1%BA%A1t_gi%E1%BA%A3i_Nobel_V%C4%83n_h%E1%BB%8Dc';

const getInfo = async () => {
  const html = await axios.get(url);
  let $ = cheerio.load(html.data);
  const data = [];

  let lastYear = ''; // Biến để lưu trữ năm của dòng trước đó

  // Lặp qua các hàng của bảng, bỏ qua hàng tiêu đề và hàng thập niên
  $('table tbody tr').each((index, element) => {
    const tds = $(element).find('td');

    if (tds.length === 6 || tds.length === 7) {
      let year = $(tds[0]).text().trim();
      if (year === '') {
        year = lastYear; // Sử dụng năm của dòng trước đó nếu không có năm
      } else {
        lastYear = year; // Cập nhật năm mới
      }

      const author = $(tds.length === 6 ? tds[1] : tds[2]).find('a').first().text().trim();
      const country = $(tds.length === 6 ? tds[2] : tds[3]).find('a').last().text().trim();
      // const work = $(tds.length === 6 ? tds[3] : tds[4]).find('p').first().text().trim();
      const work = $(tds.length === 6 ? tds[3] : tds[4]).find('p').first().text().trim().split(';');
      const workFormat = work.map((item) => item.trim());

      data.push({ year, author, country, work: workFormat });
    }
  });

  // const dataNewFormat = data.map((item) => item?.work.map(b => `${b} - ${item.author}`))
  const dataNewFormat = data.reduce((acc, item) => {
    return [...acc, ...item.work.map(b => b ? `${b} - ${item.author}` : '').filter(b => b)];
  }, []);

  const jsonData = JSON.stringify(data, null, 2);
  // const jsonData = JSON.stringify(dataNewFormat, null, 2);

  const outputPath = path.join(__dirname, 'output.json');

  // Ghi dữ liệu vào file
  fs.writeFile(outputPath, jsonData, (err) => {
    if (err) {
      console.error('Có lỗi khi ghi file:', err);
    } else {
      console.log('Dữ liệu đã được ghi vào file:', outputPath);
    }
  });
};
getInfo();