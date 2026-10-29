/* =========================================================
   THƯ ĐẠO QUỐC TẾ – DỮ LIỆU SONG NGỮ (EN / VI)
   window.QT_DATA = { intro:[bài nhập môn], path52:[lộ trình 52 tuần], demo:{workshops,packages,videos} }
   - Nội dung khoá nhập môn diễn giải từ sách "Thư pháp Việt – Cho người mới" (Thanh Phong – Bùi Khắc Sáng),
     cùng lộ trình với khoá Online 52 buổi trên thudao.com. Không dùng HTML trong dữ liệu.
   - Lịch workshop, giá gói học và link video thật nằm ở Google Sheet của Apps Script Intl.gs;
     phần demo bên dưới chỉ hiện khi trang chưa nối Apps Script (để xem thử giao diện).
========================================================= */
(function(){
'use strict';
var D=window.QT_DATA=window.QT_DATA||{};

D.intro=[
{n:1,code:'N1',free:true,
 title:{en:'What is Vietnamese calligraphy?',vi:'Thư pháp Việt là gì?'},
 summary:{en:'Meet thư pháp Việt: the Vietnamese alphabet (chữ Quốc ngữ) written with a soft brush and ink, where every stroke carries rhythm, breath and intention.',
          vi:'Làm quen với thư pháp Việt: chữ Quốc ngữ viết bằng bút lông và mực, mỗi nét mang nhịp điệu, hơi thở và ý tứ của người viết.'},
 steps:{en:['Look at several finished works and notice three things: the black of the strokes, the white space around them and the overall layout (chương pháp).','Learn the four elements the course trains together: bút pháp (brush control), mặc pháp (ink use), chương pháp (layout) and nhãn pháp (the trained eye).','Understand the path: first strokes, then letters, then words, then a small finished piece with a seal.'],
        vi:['Xem một số tác phẩm và để ý ba điều: phần đen của nét, khoảng trắng quanh nét và bố cục chung (chương pháp).','Làm quen bốn yếu tố khoá học rèn cùng lúc: bút pháp (điều khiển bút), mặc pháp (dùng mực), chương pháp (bố cục) và nhãn pháp (con mắt quan sát).','Hiểu lộ trình: luyện nét trước, rồi đến chữ cái, từ, và cuối cùng là một tác phẩm nhỏ có ấn.']},
 task:{en:'Choose one Vietnamese word you would love to write one day (for example Tâm, An, Nhẫn) and tell us why in the note when you submit.',
       vi:'Chọn một chữ tiếng Việt bạn muốn viết được (ví dụ Tâm, An, Nhẫn) và ghi lý do vào phần ghi chú khi nộp bài.'}},
{n:2,code:'N2',
 title:{en:'The four treasures and your practice corner',vi:'Văn phòng tứ bảo và góc học tập'},
 summary:{en:'Brush, ink, paper and inkstone (văn phòng tứ bảo). Choose simple, honest tools and set up a calm, well-lit table.',
          vi:'Bút, mực, giấy, nghiên (văn phòng tứ bảo). Chọn dụng cụ đơn giản, đúng chất lượng và sắp xếp một góc bàn yên tĩnh, đủ sáng.'},
 steps:{en:['A good brush has a sharp tip, even hairs, a round body and spring (tiêm, tề, viên, kiện). Do not choose by price or decoration alone.','Use bottled ink to start, practice paper with a grid, and a small dish if you have no inkstone. Put a felt or cloth under the paper.','Keep the table flat, light coming from the side, tools on your writing-hand side.','After writing, rinse the brush gently in clean water, reshape the tip and let it dry hanging or lying flat.'],
        vi:['Bút tốt có đầu nhọn, lông đều, thân tròn và có độ đàn hồi (tiêm, tề, viên, kiện). Không chọn bút chỉ theo giá hay hình thức.','Mới học có thể dùng mực nước đóng chai, giấy tập có ô và đĩa nhỏ thay nghiên. Lót nỉ hoặc vải dưới giấy.','Mặt bàn bằng phẳng, ánh sáng chiếu nghiêng, dụng cụ đặt phía tay viết.','Viết xong rửa bút nhẹ nhàng bằng nước sạch, vuốt lại đầu lông, phơi khô tự nhiên.']},
 task:{en:'Photograph your four treasures and your practice corner and submit the photo.',vi:'Chụp ảnh bộ văn phòng tứ bảo và góc học tập của bạn rồi nộp ảnh.'}},
{n:3,code:'N3',
 title:{en:'Posture, holding the brush and loading ink',vi:'Tư thế, cầm bút và lấy mực'},
 summary:{en:'Sit upright, keep the brush vertical (chính phong) and load ink only into the part of the hairs you need.',
          vi:'Ngồi thẳng, giữ quản bút thẳng đứng (chính phong) và chỉ đưa mực vào phần lông cần dùng.'},
 steps:{en:['Sit with both feet on the floor, back straight, the non-writing hand resting on the paper.','Hold the brush vertically with stable fingers and a hollow palm; move from the wrist and forearm instead of twisting the brush with the fingers. Do not rest the little finger on the table.','Wet the brush first, dip only the tip third into ink, then wipe the excess on the rim of the dish.','Test on scrap paper: the stroke should be black without dripping.'],
        vi:['Ngồi hai chân chạm sàn, lưng thẳng, tay không viết đặt giữ giấy.','Cầm bút thẳng đứng, các ngón ổn định, lòng bàn tay rỗng; điều khiển bằng cổ tay và cẳng tay thay vì vặn bút bằng ngón. Không tì ngón út xuống bàn.','Làm ẩm bút trước, chỉ chấm khoảng một phần ba đầu lông vào mực, gạn bớt mực thừa ở miệng đĩa.','Thử trên giấy nháp: nét đen rõ, không nhỏ giọt.']},
 task:{en:'Ask someone to take a photo of you holding the brush in writing posture and submit it.',vi:'Nhờ người chụp ảnh bạn đang cầm bút ở tư thế viết và nộp ảnh.'}},
{n:4,code:'N4',
 title:{en:'The first dot: lộ phong',vi:'Nét chấm lộ phong'},
 summary:{en:'Your first stroke: a dot whose entry is pointed and whose end is round – the visible tip of the brush (lộ phong).',
          vi:'Nét đầu tiên: nét chấm có đầu nhọn và phần thu tròn – đầu bút lộ ra trên giấy (lộ phong).'},
 steps:{en:['Touch the paper lightly with the tip, then press down slowly and diagonally.','Lift gradually and turn the hairs to finish with a rounded end.','Write each dot in its own grid square so you can compare both sides of the stroke.','Never repaint a dot. Write a new one and change one thing each time.'],
        vi:['Đặt nhẹ đầu bút xuống giấy rồi ấn từ từ theo hướng chéo.','Nhấc dần và xoay lông bút để thu nét tròn.','Viết mỗi chấm trong một ô để so sánh hai bên nét.','Không tô sửa nét đã viết. Viết nét mới và mỗi lần chỉ sửa một điểm.']},
 task:{en:'Write one page of lộ phong dots (at least 20) and submit your best page.',vi:'Viết một trang nét chấm lộ phong (ít nhất 20 chấm) và nộp trang đẹp nhất.'}},
{n:5,code:'N5',
 title:{en:'Lines with a centred tip: trung phong',vi:'Nét ngang, nét dọc trung phong'},
 summary:{en:'Every line has three stages – entry, travel and exit (khởi, hành, thu). During travel the tip stays in the centre of the line (trung phong).',
          vi:'Mỗi nét có ba giai đoạn khởi – hành – thu. Khi hành bút, đầu bút đi giữa lòng nét (trung phong).'},
 steps:{en:['Enter the stroke, pause, then travel at an even speed with the brush upright.','Watch the tip: if it drifts to one edge, the line becomes thin and scratchy on one side.','Finish by slowing down and lifting, not by flicking.','Write horizontal lines, then vertical lines, keeping the same thickness from start to end.'],
        vi:['Khởi bút, dừng nhẹ, rồi hành bút đều tay với quản bút thẳng.','Quan sát đầu bút: nếu lệch về một mép, nét sẽ mỏng và xước một bên.','Thu nét bằng cách chậm lại và nhấc bút, không hất bút.','Luyện nét ngang rồi nét dọc, giữ độ dày đều từ đầu đến cuối.']},
 task:{en:'Write one page of horizontal and vertical trung phong lines and submit it.',vi:'Viết một trang nét ngang và nét dọc trung phong rồi nộp bài.'}},
{n:6,code:'N6',
 title:{en:'Using different parts of the brush',vi:'Dùng các phần khác nhau của bút'},
 summary:{en:'The tip (tiêm phong), the belly (yêu phong) and the root of the brush give different widths. Pressure changes the line.',
          vi:'Đầu bút (tiêm phong), bụng bút (yêu phong) và căn bút cho độ dày khác nhau. Lực nhấn làm thay đổi nét.'},
 steps:{en:['Draw one line touching only the tip, one using half the hairs and one using the belly.','Change pressure smoothly (đề – án: lift and press) rather than pushing suddenly.','Do not crush the whole brush or load ink into the root.','Reshape the tip on the rim of the dish before each new line.'],
        vi:['Viết một nét chỉ chạm đầu bút, một nét dùng nửa lông, một nét dùng bụng bút.','Đổi lực nhấn mềm mại (đề – án) thay vì ấn đột ngột.','Không ép cả đầu bút và không ngâm mực tới căn bút.','Vuốt lại đầu bút ở miệng đĩa trước mỗi nét mới.']},
 task:{en:'Write three rows of lines from thin to thick and submit the page.',vi:'Viết ba hàng nét từ mảnh đến đậm và nộp bài.'}},
{n:7,code:'N7',
 title:{en:'Wrist movement and curves',vi:'Vận động cổ tay và nét cong'},
 summary:{en:'Curves and turns come from the wrist and forearm working together (dụng uyển), not from rolling the brush in the fingers.',
          vi:'Nét cong và đổi hướng đến từ cổ tay phối hợp cẳng tay (dụng uyển), không phải lăn bút bằng ngón tay.'},
 steps:{en:['Practise slow circles and arcs in the air, then on paper.','Keep the fingers still and let the wrist guide the direction.','Write the round letters o, c and a, watching the white space inside them.','Compare with the model: position, direction, proportion – fix one thing per round.'],
        vi:['Tập vòng tròn và đường cong chậm trên không, rồi trên giấy.','Giữ ngón tay ổn định, để cổ tay dẫn hướng.','Viết các chữ tròn o, c, a và để ý khoảng trắng bên trong.','So với mẫu: vị trí, hướng, tỉ lệ – mỗi lượt sửa một điểm.']},
 task:{en:'Write a page of the letters o, c, a and submit it.',vi:'Viết một trang chữ o, c, a và nộp bài.'}},
{n:8,code:'N8',
 title:{en:'Copying a model (Lâm Mô) and your first word',vi:'Lâm mô và chữ đầu tiên'},
 summary:{en:'Lâm Mô means learning from a model: first understand how it was written, then write it yourself. You finish the course with one complete word.',
          vi:'Lâm mô là học theo mẫu: hiểu mẫu được viết thế nào rồi tự viết lại. Kết thúc khoá với một chữ hoàn chỉnh.'},
 steps:{en:['Put the model in front of you and study stroke order, proportion and white space.','Write the word slowly; compare each part with the model.','Write it again until the word stands balanced on its own.','Choose your best version and sign it with your name in small letters on the left.'],
        vi:['Đặt mẫu trước mặt, phân tích thứ tự nét, tỉ lệ và khoảng trắng.','Viết chữ chậm rãi, so từng phần với mẫu.','Viết lại cho đến khi chữ đứng vững, cân đối.','Chọn bản đẹp nhất và ký tên nhỏ bên trái.']},
 task:{en:'Write the word you chose in lesson 1 (or Tâm) and submit it for the teacher’s review and score.',vi:'Viết chữ bạn đã chọn ở bài 1 (hoặc chữ Tâm) và nộp để giáo viên nhận xét, chấm điểm.'}}
];

/* Lộ trình 52 tuần (bản tiếng Anh tóm tắt; bản tiếng Việt đầy đủ ở thudao.com). Điền bởi quoc-te-path52.js */
D.path52=D.path52||[];

/* Dữ liệu xem thử – chỉ dùng khi chưa có Apps Script */
D.demo={
 workshops:[
  {id:'WS-DEMO-1',title_en:'Brush & Ink – 3-hour taster',title_vi:'Bút & Mực – trải nghiệm 3 giờ',date:'2026-11-22',time:'09:00 – 12:00',city:'Hà Nội',
   address:'Kim Mã, Giảng Võ, Hà Nội',map:'',price_usd:'—',price_vnd:'—',seats:10,left:10,status:'OPEN',
   desc_en:'Sample event (demo). Tools, tea and a finished piece with your name to take home.',desc_vi:'Sự kiện mẫu (demo). Có dụng cụ, trà và một tác phẩm có tên bạn mang về.'},
  {id:'WS-DEMO-2',title_en:'Weekend intensive – write your first word',title_vi:'Lớp cuối tuần – viết chữ đầu tiên',date:'2026-12-05',time:'08:30 – 16:30',city:'Hà Nội',
   address:'Kim Mã, Giảng Võ, Hà Nội',map:'',price_usd:'—',price_vnd:'—',seats:8,left:3,status:'OPEN',
   desc_en:'Sample event (demo). Strokes, letters and one framed word.',desc_vi:'Sự kiện mẫu (demo). Luyện nét, chữ cái và một chữ đóng khung.'}
 ],
 packages:[
  {id:'INTRO',course:'intro',name_en:'Foundations – 8 lessons',name_vi:'Nhập môn – 8 bài',price_usd:'—',price_vnd:'—',
   features_en:'All 8 video lessons|Submit work and get scored|Lifetime access',features_vi:'Đủ 8 bài video|Nộp bài, được chấm điểm|Xem lại trọn đời'},
  {id:'PATH52',course:'path52',name_en:'Complete path – 52 weeks',name_vi:'Lộ trình đầy đủ – 52 tuần',price_usd:'—',price_vnd:'—',
   features_en:'Foundations included|52 weekly lessons and videos|Personal feedback on every submission|Graduation exam',features_vi:'Bao gồm khoá Nhập môn|52 bài theo tuần kèm video|Nhận xét từng bài nộp|Thi tốt nghiệp'}
 ],
 videos:[]
};
})();
