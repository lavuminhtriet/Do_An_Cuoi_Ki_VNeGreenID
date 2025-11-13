// data/garbageData.js

export const GARBAGE_CATEGORIES = [
  {
    id: 'huu-co',
    name: 'Rác Hữu cơ',
    icon: 'food-apple-outline', 
    color: '#4CAF50', 
    description: 'Rác dễ phân hủy trong tự nhiên.',
    examples: ['Thức ăn thừa', 'Rau củ quả', 'Lá cây', 'Vỏ trứng', 'Bã cà phê'],
    guidelines: [
      'Để riêng vào túi/thùng màu xanh lá.',
      'Có thể ủ làm phân compost tại nhà.',
      'Không lẫn các loại rác khác vào.'
    ],
    dropOffPoints: [
      'Các điểm thu gom rác hữu cơ của HTX Môi trường.',
      'Trạm xử lý rác thải A (Địa chỉ...)'
    ]
  },
  {
    id: 'nhua',
    name: 'Rác Tái chế (Nhựa)',
    icon: 'bottle-soda-classic-outline',
    color: '#FFEB3B', 
    description: 'Các loại nhựa có thể tái chế.',
    examples: ['Chai nước suối (PET)', 'Vỏ chai dầu gội', 'Hộp sữa chua', 'Đồ chơi nhựa'],
    guidelines: [
      'Làm sạch, loại bỏ thức ăn thừa trước khi bỏ.',
      'Nén/làm bẹp chai nhựa để tiết kiệm diện tích.',
      'Tách riêng nắp chai và thân chai nếu có thể.'
    ],
    dropOffPoints: [
      'Các thùng rác màu vàng tại nơi công cộng.',
      'Điểm thu mua ve chai/phế liệu.',
      'Dự án "Thu gom nhựa tái chế" (Địa chỉ...)'
    ]
  },
  {
    id: 'kim-loai',
    name: 'Rác Tái chế (Kim loại)',
    icon: 'cog',
    color: '#9E9E9E', 
    description: 'Các vật dụng bằng kim loại.',
    examples: ['Lon bia', 'Lon nước ngọt', 'Hộp sữa đặc', 'Vật dụng sắt/nhôm hỏng'],
    guidelines: [
      'Làm sạch và để khô ráo.',
      'Cẩn thận với các cạnh sắc nhọn.'
    ],
    dropOffPoints: [
      'Điểm thu mua ve chai/phế liệu.'
    ]
  },
  {
    id: 'dien-tu',
    name: 'Rác Nguy hại (Điện tử)',
    icon: 'battery-alert-variant',
    color: '#F44336', 
    description: 'Chất thải điện tử chứa mạch và kim loại nặng.',
    examples: ['Pin', 'Sạc dự phòng', 'Bóng đèn huỳnh quang', 'Điện thoại, laptop hỏng'],
    guidelines: [
      'TUYỆT ĐỐI KHÔNG vứt chung với rác sinh hoạt.',
      'Để riêng và giữ khô ráo.',
      'Không làm vỡ, đập bóng đèn hay pin.'
    ],
    dropOffPoints: [
      'Các điểm "Thu hồi Pin" tại siêu thị (Winmart, Circle K).',
      'Điểm thu gom rác thải điện tử của quận/huyện.'
    ]
  },
  {
    id: 'y-te',
    name: 'Rác Nguy hại (Y tế)',
    icon: 'needle',
    color: '#F44336', 
    description: 'Rác thải y tế gia đình có nguy cơ lây nhiễm.',
    examples: ['Khẩu trang đã qua sử dụng', 'Kim tiêm (nếu có)', 'Bông băng, gạc'],
    guidelines: [
      'Cho vào túi nilon riêng và cột chặt.',
      'Đối với vật sắc nhọn (kim tiêm), phải cho vào chai nhựa cứng trước khi bỏ.',
      'Rửa tay sau khi xử lý.'
    ],
    dropOffPoints: [
      'Chỉ vứt vào thùng rác chuyên dụng cho rác y tế (nếu có).',
      'Nếu không, phải bọc kín và ghi chú "RÁC Y TẾ" trước khi bỏ vào thùng rác chung.'
    ]
  },
];