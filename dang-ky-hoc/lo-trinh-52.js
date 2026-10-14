/* =========================================================
   LỘ TRÌNH KHOÁ THƯ PHÁP ONLINE 52 BUỔI – DỮ LIỆU BÀI HỌC
   (tách từ trang "Lộ trình 52 buổi"; dùng cho trang Đăng ký học)
   window.OCD_LESSONS_52 = [ {id, title, shortTitle, description, guide[], tasks[], code,
                              acceptedCodes?, submitUrl, submitLabel, references?, source?, gallery?} x 53 ]
========================================================= */
(function(){
'use strict';
/* CẬP NHẬT BÀI HỌC: 0 là Chuẩn bị. 1 là mẫu T1; thêm các mục 2,3,...,52 dưới đây.
Mẫu: 2:{title:'Tên bài',description:'Mô tả',guide:['Bước 1','Bước 2'],tasks:['Nhiệm vụ'],submitUrl:'https://www.thudao.com/p/nop-bai.html',submitLabel:'Nộp bài',code:'Mã bài'}
Không dùng HTML trong dữ liệu; nội dung được hiển thị bằng textContent. */
/* Nội dung dưới đây được biên soạn, diễn giải từ sách "Thư pháp Việt - Cho người mới"
   của Thanh Phong - Bùi Khắc Sáng theo các chương ghi ở source.
   tasks là nhiệm vụ của lộ trình, không phải trích nguyên văn sách.
   Tuần 4 diễn giải việc quan sát/hình dung/điều khiển tay-bút, không khẳng định cơ chế thần kinh.
   Có thể thêm references:[{title:'Tên bài viết',url:'https://...'}] cho từng tuần.
   acceptedCodes là các mã được chấp nhận cho cùng một tuần; không cộng trùng tiến độ. */
var LESSON_OVERRIDES={
0:{title:'Tuần Chuẩn bị - Đồ dùng và góc học tập',shortTitle:'Chuẩn bị',description:'Chuẩn bị văn phòng tứ bảo, làm quen với đặc tính của bút, mực, giấy và sắp xếp góc học tập trước khi luyện viết.',guide:['Chuẩn bị bút lông, mực, giấy và nghiên hoặc dụng cụ đựng mực theo hướng dẫn của lớp. Chọn dụng cụ phù hợp với cỡ chữ và mục đích luyện tập.','Tìm hiểu các phẩm chất tiêm, tề, viên, kiện của bút: đầu nhọn, lông đều, dáng bút tròn và khả năng đàn hồi. Không chỉ chọn bút theo giá hoặc hình thức.','Sắp xếp mặt bàn bằng phẳng, đủ ánh sáng, có vật dụng lót bàn; đặt dụng cụ thuận tay và giữ khoảng nhìn rõ đường bút.','Sau khi sử dụng, rửa bút nhẹ nhàng bằng nước sạch, vuốt lại đầu lông và để nơi thoáng cho khô tự nhiên.'],tasks:['Chụp ảnh rõ đồ dùng và góc học tập đã chuẩn bị.','Mở trang nộp bài, điền thông tin học viên, chọn bài VPTB và gửi ảnh.'],code:'VPTB',submitUrl:'https://www.thudao.com/p/nop-bai.html',submitLabel:'Gửi ảnh VPTB',gallery:true,references:[{title:'Chọn lựa bút viết thư pháp',url:'https://www.thudao.com/2026/09/chon-but-lo.html?m=1'},{title:'Người mới nên mua đồ gì',url:'https://www.thudao.com/2026/09/do-.html?m=1'}],source:'Thư pháp Việt - Cho người mới: Chương 3 - Tư thế, tâm thế; Chương 4 - Đồ dùng, văn phòng tứ bảo.'},
/* MẪU T1: các tuần tiếp theo dùng cùng bố cục Mô tả - Hướng dẫn - Nhiệm vụ.
   Sửa nội dung ở từng mục nhưng giữ nguyên code và acceptedCodes đã quy định. */
1:{title:'Tuần 1 - Cầm bút, lấy mực và nét lộ phong',shortTitle:'Tuần 1 - Nét lộ phong',available:true,description:'Làm quen với tư thế cầm bút, cách đưa mực vào lông bút và gạn mực; bắt đầu luyện nét chấm lộ phong với phần đầu nhọn, phần thu tròn.',guide:['Giữ quản bút ở trạng thái chính phong khi bắt đầu. Chọn vị trí cầm để tay không che đường nét; tránh cầm quá thấp hoặc quá cao so với khả năng kiểm soát.','Giữ các ngón ổn định và lòng bàn tay có khoảng rỗng. Theo cách luyện của Thư Môn, tránh tì ngón út để ke đường; điều khiển bằng cổ tay phối hợp cẳng tay thay vì vặn bút bằng ngón.','Làm ẩm bút trước khi lấy mực; đưa mực vào phần lông cần dùng, không ngâm ngập căn bút. Gạn phần mực dư và thử trên giấy để kiểm tra lượng mực.','Luyện nét chấm lộ phong chậm, có kiểm soát: quan sát đầu nét nhọn và phần thu tròn. Dùng ô tập để so sánh hai bên nét, không tô sửa nét đã viết.'],tasks:['Luyện bài nét chấm lộ phong theo mẫu được hướng dẫn trong buổi học.','Chụp ảnh bài tập và gửi qua trang nộp bài với mã T1.'],source:'Thư pháp Việt - Cho người mới: Chương 5 - Cách cầm bút, bát diện bút; Chương 6 - Mặc pháp; Chương 9 - Cơ bản công, phần lộ phong.'},
2:{title:'Tuần 2 - Các yếu tố của thư pháp và trung phong hành bút',shortTitle:'Tuần 2 - Trung phong',available:true,description:'Nhìn thư pháp như sự phối hợp giữa công cụ, kỹ thuật đường nét, cách dùng mực, bố cục và khả năng cảm nhận. Tập phân biệt khởi bút, hành bút, thu bút qua bài trung phong.',guide:['Phân biệt bút pháp (điều khiển bút), mặc pháp (dùng mực), chương pháp (bố cục) và nhãn pháp (quan sát, đánh giá). Xem chúng như các yếu tố phối hợp, không phải những phần độc lập.','Phân tích đường nét qua ba giai đoạn khởi - hành - thu; nhận biết lộ phong ở khởi/thu và trung phong ở hành bút. Riêng nét chấm có thể chỉ thể hiện khởi và thu.','Quan sát trạng thái phong bút trong quá trình đi nét theo mẫu. Đối chiếu bút đang hành trung phong hay lệch sang trắc/thiên phong, đồng thời kiểm soát hướng đi và lực tay.','Viết chậm để nhận ra sự thay đổi của nét và lượng mực. So sánh các lần viết, tìm nguyên nhân nét xước hoặc lực tay chưa đều thay vì tô lại nét.'],tasks:['Luyện bài trung phong hành bút theo mẫu của buổi học.','Chụp ảnh và nộp bài với mã T2.'],source:'Thư pháp Việt - Cho người mới: Chương 6 - Mặc pháp; Chương 7 - Dụng bút; Chương 9 - Cơ bản công; Chương 14 - Chương pháp; Chương 20 - Nhãn pháp.'},
3:{title:'Tuần 3 - Sử dụng các phần khác nhau của bút',shortTitle:'Tuần 3 - Các phần bút',available:true,description:'Nhận biết tiêm phong, yêu phong và căn bút; hiểu ảnh hưởng của phần lông tiếp xúc, độ nhấn và mặt bút đến độ dày, hình dáng đường nét.',guide:['Xác định tiêm phong ở khoảng một phần ba đầu lông, yêu phong ở bụng bút và căn bút gần nơi lông nối vào đẩu bút. Phân biệt trường phong (độ dài lông) và khẩu kính (độ rộng).','So sánh nét khi phần đầu lông tiếp xúc ít hoặc nhiều với giấy. Theo dõi sự thay đổi độ dày khi đề - án, thay vì nhấn sâu một cách đột ngột.','Làm quen với các mặt bút theo bát diện bút và quan sát trạng thái lông khi đổi hướng. Giữ tư thế cầm giúp nhìn được vùng tiếp xúc.','Chỉ dùng phần lông phù hợp với bài tập; tránh ép toàn bộ đầu lông hoặc ngâm mực sâu vào căn bút. Gạn mực và chỉnh lại phong bút trước lần tập tiếp theo.'],tasks:['Thực hành bài sử dụng các phần bút theo hướng dẫn tuần 3.','Chụp ảnh bài tập và nộp với mã T3.'],source:'Thư pháp Việt - Cho người mới: Chương 4 - Đồ dùng, cấu tạo bút; Chương 5 - Cách cầm bút, bát diện bút; Chương 6 - Mặc pháp.'},
4:{title:'Tuần 4 - Não bộ, quan sát và điều khiển bút',shortTitle:'Tuần 4 - Tư duy luyện tập',available:true,description:'Tìm hiểu cách quan sát mẫu, hình dung đường đi và điều khiển tay-bút phối hợp khi luyện thư pháp. Theo cách giải thích của sách, luyện theo mẫu giúp người mới củng cố sự phối hợp này.',guide:['Trước khi viết, nhìn kỹ điểm khởi, hướng di chuyển, độ dày và điểm thu; hình dung phong bút sẽ tiếp xúc với giấy ra sao.','Thực hiện nét theo hình dung đã chuẩn bị, đồng thời quan sát kết quả trên giấy. Tách việc phân tích lỗi khỏi cảm giác nóng vội muốn viết cho xong.','Đối chiếu nét vừa viết với mẫu: khác ở vị trí, hướng, tỉ lệ hay cách dùng mực? Chọn một điểm cần sửa cho lần luyện tiếp theo.','Quan sát cả nét đen và khoảng trắng xung quanh. Lặp lại quá trình nhìn mẫu - hình dung - viết - đối chiếu để rèn khả năng cảm nhận và kiểm soát công cụ.'],tasks:['Thực hiện bài tập tuần 4 theo mẫu và hướng dẫn của lớp.','Chụp ảnh bài luyện tập và nộp với mã T4.'],source:'Thư pháp Việt - Cho người mới: Chương 5 - Cách cầm bút; Chương 8 - Lâm mô; Chương 17 - Giống và khác, đúng và sai, phần tư duy cần có.'},
5:{title:'Tuần 5 - Khái niệm Lâm Mô',shortTitle:'Tuần 5 - Lâm Mô',available:true,description:'Phân biệt mô (đồ theo mẫu) với lâm (nhìn mẫu để viết lại). Mục tiêu là tìm hiểu hình dáng, bút pháp và ý đồ của người viết, không chỉ sao chép vẻ ngoài.',acceptedCodes:['T5','LM'],codeLabel:'LM hoặc T5',guide:['Hiểu mô là đồ theo chữ mẫu hoặc đường viền mẫu; lâm là quan sát và viết lại. Người mới nên làm quen với đối lâm trước khi chuyển sang các cách luyện phức tạp hơn.','Đặt mẫu trước mắt, phân tích thứ tự nét, tỉ lệ và khoảng trắng. Dùng ô tập khi cần để đối chiếu vị trí, không biến việc luyện thành tô sửa nét đã hoàn thành.','Viết lại theo mẫu, so sánh từng phần và tìm bút pháp đã tạo ra nét. Cố gắng hiểu cách viết thay vì chỉ làm cho hình dáng giống mẫu.','Sau mỗi lượt, nhận xét phần giống và khác, chọn lỗi cần sửa rồi luyện lại. Việc sáng tạo phong cách riêng cần dựa trên nền tảng quan sát và kỹ thuật đã rèn.'],tasks:['Thực hiện bài lâm mô theo mẫu được giao trong tuần 5.','Chụp ảnh bài tập và nộp với mã LM hoặc T5. Chỉ cần một trong hai mã; hai mã cùng được tính cho một tuần.'],source:'Thư pháp Việt - Cho người mới: Chương 8 - Lâm mô là gì; Chương 17 - Giống và khác, đúng và sai.'},
6:{title:'Tuần 6 - Vận động cổ tay',shortTitle:'Tuần 6 - Vận động cổ tay',available:true,description:'Làm quen với dụng uyển: phối hợp chuyển động cổ tay, cẳng tay và khuỷu tay để điều khiển bút linh hoạt, đặc biệt khi đi đường cong và đổi hướng.',guide:['Nhận biết các chuyển động lên - xuống, trái - phải và xoay của cổ tay. Giữ ngón tay ổn định, tránh chỉ xoay quản bút bằng các ngón để đổi hướng nét.','Bắt đầu từ chính phong, dùng cổ tay điều khiển hướng đi trong giai đoạn hành bút rồi đưa bút trở về trạng thái phù hợp khi thu.','Luyện nét ngang, nét dọc và nét cong theo mẫu. Quan sát đường đi thực tế trên giấy để điều chỉnh, không chỉ dựa vào cảm giác tay đang đi thẳng.','Phối hợp cẳng tay, khuỷu tay theo cỡ chữ. Luyện chậm, giữ chuyển động tự nhiên và kiểm soát phong bút khi đổi hướng.'],tasks:['Luyện bài vận động cổ tay theo mẫu và hướng dẫn tuần 6.','Chụp ảnh bài tập và nộp với mã T6.'],source:'Thư pháp Việt - Cho người mới: Chương 5 - Cách cầm bút; Chương 10 - Dụng uyển, khỏa thúc.'}
};
/* TUẦN 7-52: diễn giải và định hướng luyện tập theo sách đã tham khảo.
   Các mẫu hình, đề thi và tiêu chí chấm cụ thể do giáo viên cung cấp.
   Danh sách gốc lặp Tuần 31: Hư bộ giữ 31; Nghệ thuật bồi biểu xếp Tuần 32.
   Mỗi dòng: [tuần, tên đầy đủ, tên ngắn, mô tả, hướng dẫn, bài tập, chương tham khảo]. */
var LESSON_CONTINUATION=[
[7,'Chính phong - Điều phong - Bát diện bút','Bát diện bút','Nhận biết tư thế quản bút, trạng thái phong bút và các mặt bút khi đổi hướng; tập đọc dấu vết kỹ thuật trên một bức thư pháp.',[
'Phân biệt chính phong (tư thế bút) với trạng thái đầu lông đang tiếp xúc giấy. Quan sát cách điều phong để chuyển từ khởi sang hành và thu mà vẫn kiểm soát nét.',
'Đối chiếu các mặt bút theo sơ đồ bát diện của lớp. Chọn những nét rõ trong tác phẩm, đánh dấu hướng đi và nhận xét mặt bút có thể đã được dùng; ghi rõ phần còn chưa chắc chắn.'
],'Chọn một bức thư pháp và làm bài tập phân tích bát diện bút: chú thích hướng nét, khởi - hành - thu và cách điều phong quan sát được.','Chương 5 - Cách cầm bút, bát diện bút; Chương 7 - Dụng bút'],
[8,'Mặc phân ngũ sắc','Mặc phân ngũ sắc','Tìm hiểu sự phân cấp sắc độ của mực và quan hệ giữa mực, bút, giấy; quan sát tác dụng của đậm - nhạt, khô - ướt trong bài viết.',[
'Theo sách, ngũ sắc không phải năm màu mực riêng biệt. Quan sát các mức sắc mực trên mẫu, đối chiếu cách phân chia tiêu, nùng, trọng, đạm, thanh.',
'Thử lượng mực, nước và cách gạn trên giấy tập; theo dõi ảnh hưởng của giấy và tốc độ bút. Lâm mô bằng thao tác viết, tránh tô lại nét để giả hiệu ứng sắc mực.'
],'Lâm mô một bài viết có sử dụng mặc sắc theo mẫu của lớp; kèm nhận xét những vùng đậm - nhạt, khô - ướt đã thể hiện.','Chương 6 - Mặc pháp; Chương 8 - Lâm mô'],
[9,'Cửu dụng 1 - Đôn phong, Bút đạo và Mặc đạo','Đôn phong','Làm quen đôn phong ở khởi bút và quan sát sự phối hợp giữa dấu vết đường bút với dấu vết mực trên giấy.',[
'Theo sách, đôn phong làm mao bút khụy xuống và dùng sự chuyển mặt bút để đi vào giai đoạn hành. Thực hiện chậm theo mẫu để thấy quan hệ giữa thế tay và lực nét.',
'So sánh đường đi của bút với vùng mực thực tế: lượng mực, độ thấm của giấy và cách gạn có thể làm dấu vết khác đi. Đừng chỉ đánh giá kỹ thuật qua độ đen của nét.'
],'Luyện bài đôn phong theo mẫu, kèm phân tích bút đạo và mặc đạo trên các nét đã viết.','Chương 6 - Mặc pháp; Chương 7 - Dụng bút, cửu dụng'],
[10,'Tàng phong - Nét viên bút và nét phương bút','Viên - Phương bút','Nhận biết tàng phong là trạng thái không phô đầu nhọn tự nhiên của bút; so sánh đầu nét tròn của viên bút với góc cạnh của phương bút.',[
'Quan sát khởi và thu trên hai loại mẫu. Luyện cách giấu đầu phong bằng chuỗi thao tác được hướng dẫn, thay vì tô thêm vào đầu nét sau khi viết.',
'Với viên bút, kiểm tra độ tròn và phần thu không thừa nét. Với phương bút, kiểm tra góc, hướng chuyển và lực nét; so sánh cảm giác mà hai hình thái tạo ra.'
],'Luyện nét viên bút và phương bút theo mẫu; trình bày hai nhóm nét để đối chiếu khởi, thu và hình dáng.','Chương 7 - Dụng bút; Chương 9 - Cơ bản công, tàng phong'],
[11,'Cửu dụng 2 - Toả phong và Ngự phong','Toả - Ngự phong','Phân biệt thao tác mở mao bút với cách khởi lộ phong đi trực tiếp theo đường tâm nét; quan sát sự khác nhau trong kết nối khởi và hành.',[
'Theo sách, toả phong làm mở mao bút hoặc tăng vùng lông tiếp xúc giấy. Thử theo mẫu để nhìn rõ thay đổi của diện tích tiếp xúc và bề rộng nét.',
'Ngự phong dùng một mặt bút liên kết khởi và hành theo tâm nét. So sánh với đôn phong, ghi nhận hướng đi và hình thái nét thay vì áp một cách khởi cho mọi tình huống.'
],'Luyện các nét toả phong và ngự phong theo mẫu, ghi chú điểm khác nhau trong cách tiếp xúc và chuyển sang hành bút.','Chương 7 - Dụng bút, cửu dụng'],
[12,'Cửu dụng - Dược phong, Yết và Nục','Dược - Yết - Nục','Có cái nhìn tổng quan về những thao tác làm phong bút bật lên, dựng dần quản bút hoặc chuyển tâm bút trong quá trình tạo nét.',[
'Quan sát dược phong theo mẫu: mao bút đi nghịch và có trạng thái bật, có thể tạo khoảng trắng trong nét. Phân biệt hiệu ứng này với nét thiếu mực ngoài ý muốn.',
'So sánh yết bút với nục phong: một thao tác dựng dần quản bút để thu, một thao tác chuyển tâm bút khi vẫn tiếp xúc giấy. Các tuần 13-14 sẽ luyện từng kỹ thuật riêng.'
],'Làm bài thực hành nhận diện và so sánh dược phong, yết và nục theo hướng dẫn của lớp.','Chương 7 - Dụng bút, cửu dụng; Chương 19 - Phi bạch'],
[13,'Yết bút','Yết bút','Tập kiểm soát việc dựng dần quản bút khi thu nét lộ phong; giữ phần kết thúc có chủ ý thay vì hất tay cho xong.',[
'Đối chiếu mẫu để biết hướng thu, vị trí kết thúc và sự thay đổi của quản bút. Thực hiện chậm để thấy chuyển động liên tục giữa hành và thu.',
'Kiểm tra độ gọn, hướng của đầu thu và lực nét trước khi rời giấy. Không dùng thao tác tô sửa để che phần thu chưa đạt.'
],'Luyện bài yết bút theo mẫu, đối chiếu phần thu của các lần viết.','Chương 7 - Dụng bút, giai đoạn thu bút'],
[14,'Nục phong','Nục phong','Luyện chuyển tâm bút sang hướng khác khi không nhấc bút khỏi giấy; phối hợp mở phong và đổi hướng để giữ nét liền mạch.',[
'Quan sát điểm đổi hướng trên mẫu. Theo sách, nục phong có thể kết hợp toả phong rồi xoay chuyển tâm bút; tập trong phạm vi nhỏ để kiểm soát.',
'So sánh bề rộng và lực nét trước, trong, sau điểm chuyển. Tránh xoắn mao bút hoặc làm nét thắt đột ngột do thiếu điều phong.'
],'Luyện bài nục phong theo mẫu, đánh dấu điểm chuyển tâm bút và nhận xét sự liền mạch của nét.','Chương 7 - Dụng bút; Chương 10 - Dụng uyển, khỏa thúc'],
[15,'Cửu dụng - Đốn bút','Đốn bút','Làm quen sự thay đổi góc quản bút khi đốn; nhận diện thao tác này ở thu bút hoặc những vị trí chiết, đổi hướng.',[
'Theo sách, đốn có thể được thực hiện bằng cách nghiêng quản bút ngược về hướng khởi. Quan sát mẫu để phân biệt sự thay đổi góc bút với việc chỉ nhấn mạnh hơn.',
'Luyện từng điểm chiết chậm, kiểm tra góc nét và đoạn nối tiếp. Giữ lượng mực và lực tay phù hợp để góc không bị vón hoặc rách.'
],'Luyện bài đốn bút và các điểm chiết theo mẫu của buổi học.','Chương 7 - Dụng bút, giai đoạn thu bút; Chương 9 - Cơ bản công'],
[16,'Cửu dụng - Án bút','Án bút','Tập vừa di chuyển vừa nhấn bút xuống để điều chỉnh độ dày của nét; phối hợp án với đề một cách có kiểm soát.',[
'Theo sách, án diễn ra khi bút đang di chuyển và được nhấn xuống. Thử thay đổi độ nhấn từ từ, quan sát phần lông tiếp xúc với giấy.',
'So sánh các đoạn mỏng - dày trong cùng nét. Tránh thay đổi lực quá đột ngột làm đầu nét phình to nhưng phần thân bị thắt nhỏ.'
],'Luyện bài án bút theo mẫu, thể hiện chuyển tiếp độ dày và đối chiếu với thao tác đề bút.','Chương 7 - Dụng bút; Chương 9 - Cơ bản công, đề - án'],
[17,'Tồn phong','Tồn phong','Nhận biết khoảng dừng có chủ ý để giữ ý trước khi xử lý phần tiếp theo của nét, thường gặp trước nét móc hoặc hất.',[
'Quan sát vị trí cần giữ ý trong mẫu. Dừng có kiểm soát để chuẩn bị chuyển tiếp, không coi tồn phong là ngừng suy nghĩ về hướng đi tiếp theo.',
'Thử nối phần dừng với móc hoặc hất theo hướng dẫn. Kiểm tra mạch nét và lượng mực tại chỗ dừng, tránh vón mực do kéo dài ngoài ý muốn.'
],'Luyện bài tồn phong kết hợp chuyển sang móc hoặc hất theo mẫu.','Chương 7 - Dụng bút, giai đoạn thu bút'],
[18,'Bát pháp - Nét chấm','Nét chấm','Luyện nét chấm như một đơn vị cơ bản của đường nét; quan sát hướng, hình thái khởi và thu trong các mẫu được giao.',[
'Phân tích nét chấm theo khởi và thu. Nhận diện phần nhọn, phần tròn hoặc góc cạnh để chọn thao tác phù hợp với mẫu.',
'Luyện các hướng theo bài bát pháp của lớp; so sánh tỉ lệ, lực nét và vị trí. Không ghép thêm nét tô để làm một dấu chấm trông giống mẫu.'
],'Luyện bài bát pháp nét chấm theo mẫu được giao.','Chương 7 - Cấu tạo đường nét; Chương 9 - Cơ bản công'],
[19,'Nét lượn','Nét lượn','Rèn chuyển hướng mềm mại trong một đường nét, giữ sự liên tục của lực bút và phong bút khi đường đi uốn lượn.',[
'Quan sát vị trí bắt đầu đổi hướng và đoạn chuyển trên mẫu. Phối hợp cổ tay, điều phong để đường lượn không bị xoắn hoặc đứt mạch.',
'Đối chiếu độ dày trước và sau chỗ chuyển; sửa nguyên nhân bằng lần luyện mới, tránh tô thêm vào phần bị thắt.'
],'Luyện nét lượn theo mẫu và ghi nhận điểm chuyển chưa đều.','Chương 9 - Cơ bản công; Chương 10 - Dụng uyển'],
[20,'Nét phác','Nét phác','Làm quen nét phác theo mẫu của lớp, quan sát sự kết hợp giữa hướng đi, mở phong và cách xử lý khởi - thu.',[
'Phân tích mẫu trước khi viết: hướng, góc chuyển và vùng tiếp xúc của mao bút. Không đồng nhất nét phác với động tác phẩy tay nhanh.',
'Luyện chậm để kiểm soát hình nét rồi đối chiếu độ rộng, lực và phần thu; giữ nét là kết quả của một thao tác viết.'
],'Luyện bài nét phác theo mẫu và hướng dẫn của buổi học.','Chương 7 - Dụng bút; Chương 9 - Cơ bản công'],
[21,'Nét ngang','Nét ngang','Rèn đường ngang có hướng và lực rõ ràng; phối hợp khởi, hành, thu với vận động tự nhiên của cổ tay.',[
'Nhìn mẫu để xác định hướng ngang thực tế thay vì chỉ suy đoán theo thế tay. Theo dõi tâm bút và bề rộng nét trong khi hành.',
'So sánh phần khởi, thân, thu; quan sát ảnh hưởng của án, đề và điều phong để giữ nét ổn định mà không tô sửa.'
],'Luyện bài nét ngang theo mẫu, đối chiếu hướng đi và lực nét.','Chương 7 - Dụng bút; Chương 9 - Cơ bản công; Chương 10 - Dụng uyển'],
[22,'Nét dọc','Nét dọc','Rèn hướng dọc và độ ổn định của đường nét; nhận biết cách cổ tay tác động đến đường đi của quản bút.',[
'Xác định vị trí khởi, trục đi và điểm thu theo mẫu. Quan sát nét trên giấy để điều chỉnh xu hướng cong hoặc lệch do thế tay.',
'Phối hợp cổ tay và cẳng tay, kiểm tra bề rộng giữa các đoạn. Giữ phần thu có chủ ý và tương ứng với cách khởi.'
],'Luyện bài nét dọc theo mẫu, so sánh trục nét và độ dày giữa các lần viết.','Chương 9 - Cơ bản công; Chương 10 - Dụng uyển'],
[23,'Nét móc và nét hất','Móc - Hất','Luyện chuyển tiếp từ thân nét sang móc hoặc hất, phối hợp điểm giữ ý với hướng thoát của phong bút.',[
'Phân tích điểm chuyển trên mẫu; dùng tồn phong khi phù hợp để chuẩn bị động tác tiếp theo, tránh đổi hướng đột ngột ngoài ý muốn.',
'Quan sát độ gọn, hướng và lực của móc, hất. Kết nối chúng với thân nét thay vì xem là một phần được thêm rời sau đó.'
],'Luyện bài nét móc và nét hất theo mẫu, đánh dấu điểm chuyển tiếp.','Chương 7 - Dụng bút; Chương 9 - Cơ bản công'],
[24,'Nét cong và nét vòng','Cong - Vòng','Tập vận uyển và điều phong trong các đường cong, vòng; giữ sự tự nhiên và kiểm soát mối nối của nét.',[
'Hình dung đường đi trước khi hạ bút. Phối hợp cổ tay với cẳng tay theo kích thước vòng, tránh chỉ vặn bút bằng các ngón.',
'So sánh độ cong, vùng trắng bên trong và chỗ khép hoặc chuyển tiếp. Kiểm tra lực bút không bị thắt tại những điểm đổi hướng.'
],'Luyện bài nét cong, nét vòng theo mẫu của lớp.','Chương 9 - Cơ bản công; Chương 10 - Dụng uyển, khỏa thúc'],
[25,'Thức thế - Bảng chữ cái thường','Chữ cái thường','Ứng dụng quan hệ đường thẳng và đường cong vào bảng chữ cái thường; giữ khả năng nhận diện và sự thống nhất của kiểu chữ.',[
'Phân tích thế sử, chuyển và các thế kết hợp trong từng ký tự theo mẫu. Đối chiếu trục, độ cao và vùng khoảng trắng.',
'Luyện bảng chữ cái thường trong cùng một thể, kiểu chữ; giữ tỉ lệ và lực nét thống nhất, tránh biến đổi làm khó nhận diện.'
],'Luyện bảng chữ cái thường theo mẫu, kèm phân tích thức thế của những ký tự được giao.','Chương 12 - Thể chữ, kiểu chữ; Chương 13 - Thức thế'],
[26,'Thức thế - Bảng chữ cái in hoa','Chữ cái in hoa','Phân tích thức thế và tỉ lệ của chữ in hoa; phối hợp các nét cơ bản thành ký tự rõ ràng, đồng nhất.',[
'Đối chiếu chữ hoa với mẫu để xác định trục, hướng và quan hệ các nét chính. Quan sát cả khoảng trắng được tạo ra.',
'Luyện trong cùng một hệ mẫu, so sánh độ lớn và lực nét giữa các chữ. Sự biến hoá cần giữ được nhận diện và quy luật của thể chữ.'
],'Luyện bảng chữ cái in hoa và phân tích thức thế theo yêu cầu của lớp.','Chương 12 - Thể chữ, kiểu chữ; Chương 13 - Thức thế'],
[27,'Thức thế - Âm ghép thường','Âm ghép thường','Tập kết hợp các ký tự thường thành âm ghép, điều chỉnh khoảng cách và liên kết để chúng thành một khối hài hoà.',[
'Phân tích các ký tự trong âm ghép theo mẫu, chú ý hướng của nét liền kề và khoảng trắng giữa chúng.',
'Luyện từng âm ghép trước khi đưa vào từ; giữ lực nét và tỉ lệ thống nhất, tránh chữ sát nhau quá hoặc tách thành các phần rời.'
],'Luyện bảng âm ghép thường theo mẫu và chỉ ra cách kết hợp thức thế.','Chương 12 - Kết tự, khoảng cách; Chương 13 - Thức thế'],
[28,'Thức thế - Âm ghép hoa','Âm ghép hoa','Ứng dụng thức thế vào các âm ghép hoa, giữ sự thống nhất của kiểu chữ và mối quan hệ giữa các ký tự.',[
'Quan sát quy cách âm ghép hoa trong mẫu của lớp; phân tích nét chính, nét phụ và hướng liên kết.',
'Đối chiếu chiều cao, độ rộng và khoảng trắng; điều chỉnh qua lần viết mới để khối chữ hài hoà nhưng vẫn rõ nội dung.'
],'Luyện bảng âm ghép hoa theo mẫu, kèm nhận xét thức thế và khoảng cách.','Chương 12 - Thể chữ, kết tự; Chương 13 - Thức thế'],
[29,'Thức thế - Mã bộ','Mã bộ','Tìm hiểu kết cấu mã bộ theo cách phân tích của sách và mẫu Thư Môn; quan sát vị trí các điểm cao, thấp trong khối chữ.',[
'Nhận diện khung mã bộ ở mẫu, phân tích mối quan hệ giữa đường cơ sở, đường nguyên âm và các nét tạo thế.',
'Thử bố trí ký tự, dấu thanh theo mẫu để giữ khối chữ chặt chẽ. Không đặt dấu rời quá xa hoặc kéo nét chỉ để trang trí.'
],'Luyện bài thức thế mã bộ theo mẫu, đánh dấu khung và các điểm tạo thế.','Chương 12 - Kết tự; Chương 13 - Thức thế'],
[30,'Thức thế - Cung bộ','Cung bộ','Nhận diện kết cấu cung bộ theo mẫu và tìm hiểu cách những đường cong, thẳng cùng tạo thế cho khối chữ.',[
'Phân tích khung cung bộ trong mẫu của lớp, đối chiếu các điểm tựa và vùng khoảng trắng.',
'Luyện cách kết hợp ký tự trong khung đó; giữ sự cân bằng bằng quan hệ nét và khoảng cách, không ép mọi chữ thành một hình giống nhau.'
],'Luyện bài thức thế cung bộ, kèm sơ đồ phân tích khung chữ theo mẫu.','Chương 12 - Kết tự; Chương 13 - Thức thế'],
[31,'Thức thế - Hư bộ','Hư bộ','Quan sát kết cấu hư bộ và sự kết hợp của những thế chữ qua đường cơ sở, đường nguyên âm; rèn cách cân bằng khối chữ.',[
'Theo sách, hư bộ có thể kết hợp cung bộ và mã bộ. Đối chiếu mẫu để nhận ra phần nét kéo dài và phần không gian được chừa ra.',
'Thử kết hợp nét theo mẫu rồi kiểm tra khả năng đọc và sự ổn định. Kéo dài hoặc thu gọn cần có mục đích về kết cấu.'
],'Luyện bài thức thế hư bộ theo mẫu, kèm nhận xét sự kết hợp giữa các thế.','Chương 13 - Thức thế; Chương 18 - Sự tự nhiên, sự cân bằng'],
[32,'Nghệ thuật bồi biểu','Bồi biểu','Tìm hiểu bồi biểu như công việc gia cố, trang hoàng và bảo quản tác phẩm; chọn cách trình bày phù hợp với bức viết.',[
'Phân biệt bồi (làm dày, gia cố) và biểu (trang hoàng). Quan sát giấy nền, bo viền, chỉ và trục trong một mẫu biểu.',
'Phác thảo bố cục trang trí theo kích thước, màu sắc và nơi trưng treo. Thực hành trên bài mẫu theo hướng dẫn trước khi dùng tác phẩm chính.'
],'Làm bài thực hành bồi biểu hoặc phương án bồi biểu theo mẫu được giáo viên giao; chụp rõ thành phẩm hoặc bản thiết kế.','Chương 15 - Bức thức, bồi biểu'],
[33,'Nghệ thuật khắc ấn','Khắc ấn','Làm quen vai trò của ấn chương trong tác phẩm, bố cục mặt ấn và mối quan hệ giữa dấu ấn với chữ viết.',[
'Phân biệt mục đích của các loại ấn theo bài học. Lập bố cục mặt ấn, kiểm tra nội dung và hướng của bản in thử.',
'Thực hành thiết kế, khắc và in thử theo mẫu, vật liệu, kỹ thuật do giáo viên hướng dẫn; đối chiếu độ rõ và sự cân bằng của dấu.'
],'Thực hiện bài thiết kế hoặc khắc ấn theo yêu cầu của lớp; nộp ảnh mẫu ấn và bản in thử.','Chương 16 - Ấn chương, lạc khoản; thực hành theo hướng dẫn của lớp'],
[34,'Khoả thúc - Tiểu khuyên','Tiểu khuyên','Tập phần vận động điều chỉnh phong bút trong khỏa thúc; hiểu tiểu khuyên là điều phong, không chỉ là vẽ một vòng nhỏ trên giấy.',[
'Theo sách, tiểu khuyên chỉ hoạt động dùng bút điều phong. Quan sát thao tác nhỏ ở những điểm khởi, chuyển hoặc thu trong mẫu.',
'Luyện điều phong để bước kế tiếp được nối tự nhiên, kiểm tra mao bút không bị xoắn và lực nét không đứt đoạn.'
],'Luyện bài khỏa thúc tiểu khuyên theo mẫu, chú thích vị trí điều phong.','Chương 10 - Dụng uyển, khỏa thúc'],
[35,'Khoả thúc - Đại khuyên, Ý bút và Bút đoạn ý liên','Đại khuyên - Ý bút','Phối hợp điều phong với đường đi của bút; tìm hiểu sự liên kết về hướng và ý giữa các nét dù có chỗ bút rời giấy.',[
'Theo sách, đại khuyên là thế đi của phong bút; khỏa thúc kết hợp tiểu khuyên và đại khuyên. Phân tích đường đi lớn cùng các thao tác điều phong nhỏ.',
'Đánh dấu hướng từ thu nét trước tới khởi nét sau trên mẫu. Khi bút rời giấy vẫn hình dung mạch chuyển tiếp, tránh dừng lại không có ý định tiếp nối.'
],'Luyện bài đại khuyên và bút đoạn ý liên theo mẫu; kèm sơ đồ đường ý bút.','Chương 10 - Dụng uyển, khỏa thúc, bút đoạn ý liên'],
[36,'Xuyên sáp - Tương nhượng','Xuyên sáp - Tương nhượng','Tìm hiểu cách các nét và khối chữ đan cài, nhường không gian cho nhau để bố cục gắn kết mà không khó đọc.',[
'Quan sát những điểm kéo dài, thu gọn và chừa khoảng trắng trong mẫu. Phân biệt sự đan cài có tính toán với nét đâm đụng ngoài ý muốn.',
'Thử các phương án phác thảo, đối chiếu độ rõ của chữ và nhịp khoảng cách rồi mới viết bản luyện bằng bút lông.'
],'Luyện bài xuyên sáp - tương nhượng theo mẫu, chú thích các vị trí đan cài và nhường chỗ.','Chương 13 - Thức thế; Chương 14 - Chương pháp'],
[37,'Giải phẫu chữ','Giải phẫu chữ','Làm quen các mốc cấu tạo của chữ hệ Latinh và sử dụng chúng để phân tích tỉ lệ, vị trí, khoảng cách trong thư pháp Việt.',[
'Nhận diện đường cơ sở, vùng nguyên âm và phần vươn lên hoặc xuống trong mẫu. Đối chiếu vai trò của chúng khi ghép thành từ.',
'Phân tích một chữ trước khi viết; giữ quan hệ tỉ lệ và nhận diện, đồng thời vận dụng linh hoạt theo thể, kiểu chữ đang luyện.'
],'Làm bài phân tích giải phẫu chữ và luyện các ký tự hoặc từ được giao.','Chương 2 - Thư pháp và Typography; Chương 12 - Thể chữ, kiểu chữ'],
[38,'Giàn giá chữ','Giàn giá chữ','Tập xây dựng khung kết cấu, điểm tựa và quan hệ các bộ phận để một chữ đứng vững, cân đối và dễ nhận diện.',[
'Phân tích trục, tỉ lệ cao - rộng và khoảng trắng trong chữ mẫu. Xác định nét chủ đạo và quan hệ của những nét còn lại.',
'Phác thảo các phương án khung rồi luyện viết; so sánh sự cân bằng và tính thống nhất với những chữ cùng kiểu.'
],'Làm bài phân tích giàn giá chữ và luyện khối chữ theo mẫu của buổi học.','Chương 12 - Kết tự, tỉ lệ; Chương 13 - Thức thế; Chương 18 - Sự cân bằng'],
[39,'Ngắt tăng, Bố bạch - Phi bạch','Bố bạch - Phi bạch','Phân biệt cách tổ chức chữ, dòng và khoảng trắng với những vệt trắng xuất hiện bên trong nét bút; ứng dụng để tạo nhịp cho bài viết.',[
'Theo bài học, phân tích cách ngắt tăng, bố trí dòng và phân bổ khoảng trắng giữa các thành phần. Quan sát vùng đen và trắng như một tổng thể.',
'Phân biệt bố bạch với phi bạch. Thử phi bạch theo mẫu, ghi nhận tác động của tốc độ, lượng mực, trạng thái phong và giấy; không vẽ thêm khoảng trắng vào nét.'
],'Luyện bài có tổ chức ngắt tăng, bố bạch và phi bạch theo yêu cầu của lớp; kèm nhận xét các vùng trắng.','Chương 14 - Chương pháp; Chương 18 - Sự cân bằng; Chương 19 - Phi bạch'],
[40,'Ngũ thể thư pháp - Điền thể','Điền thể','Luyện điền thể theo hệ mẫu của lớp, chú trọng kết cấu, tỉ lệ và sự nhất quán khi ghép ký tự thành chữ.',[
'Phân tích mẫu để xác định quy luật kết tự và đường nét của thể đang học. Phân biệt đặc tính thể chữ với cá tính của một kiểu chữ.',
'Luyện các chữ trong cùng hệ mẫu; so sánh khoảng cách, trục và lực nét trước khi ghép thành bài ngắn.'
],'Lâm mô bài điền thể theo mẫu, ghi nhận đặc điểm kết cấu và tỉ lệ.','Chương 12 - Thể chữ, kiểu chữ; Chương 17 - Giống và khác'],
[41,'Ngũ thể thư pháp - Thuỷ thể','Thuỷ thể','Làm quen thuỷ thể qua mẫu được giao, phân tích quy luật đường nét và cách liên kết trước khi luyện viết.',[
'Quan sát hình thái nét, khởi - thu và nhịp liên kết trong mẫu thuỷ thể. Không suy đặc tính kỹ thuật chỉ từ tên gọi của thể chữ.',
'Lâm mô trong một hệ mẫu thống nhất; giữ khả năng đọc, tỉ lệ và cách dùng mực phù hợp với bài.'
],'Lâm mô bài thuỷ thể theo mẫu, kèm nhận xét đặc điểm nét và liên kết.','Chương 12 - Thể chữ, kiểu chữ; Chương 8 - Lâm mô'],
[42,'Ngũ thể thư pháp - Mộc thể','Mộc thể','Luyện mộc thể theo mẫu, tìm hiểu khả năng biến hoá đường nét khi vẫn giữ nền tảng bút pháp và nhận diện chữ.',[
'Phân tích các nét được kéo dài, thu gọn hoặc biến đổi trong mẫu. Xác định cách chúng phục vụ thế chữ và ý vị.',
'Lâm mô trước khi thử biến đổi; mỗi thay đổi cần giữ mạch bút, tỉ lệ và khả năng đọc thay vì trang trí tùy ý.'
],'Lâm mô bài mộc thể và phân tích các vị trí biến hoá theo mẫu.','Chương 12 - Thể chữ, kiểu chữ; Chương 17 - Giống và khác'],
[43,'Ngũ thể thư pháp - Phong thể','Phong thể','Tìm hiểu phong thể theo hệ mẫu của lớp; quan sát nhịp nét, liên kết và sự thống nhất của toàn bài.',[
'Phân tích mẫu trước khi viết, ghi nhận trục chữ, tỉ lệ và những thao tác tạo nên nhịp chuyển động của đường nét.',
'Lâm mô từng phần rồi ghép thành bài; kiểm tra bút pháp, ý bút và độ rõ của nội dung, không bỏ kỹ thuật để chạy theo vẻ ngoài.'
],'Lâm mô bài phong thể theo mẫu của buổi học.','Chương 12 - Thể chữ, kiểu chữ; Chương 8 - Lâm mô'],
[44,'Ngũ thể thư pháp - Biến thể','Biến thể','Luyện biến thể trên nền tảng các quy luật đã học; phân tích giới hạn biến hoá để tác phẩm vẫn thống nhất và đọc được.',[
'Nhận diện những đặc điểm được thay đổi trong mẫu và những yếu tố cần giữ. Phân biệt biến đổi có ý đồ với nét sai ngoài kiểm soát.',
'Thử phác thảo, đối chiếu tỉ lệ và bố cục rồi mới viết. Nhận xét vì sao mỗi biến đổi phù hợp với nội dung và toàn bài.'
],'Lâm mô hoặc thực hành bài biến thể theo mẫu, kèm giải thích ý đồ biến hoá.','Chương 12 - Thể chữ, kiểu chữ; Chương 17 - Giống và khác'],
[45,'Bức thức - Trung đường, Điều phúc, Đẩu phương','Trung đường - Điều phúc','Tìm hiểu cách hình dáng và kích thước mặt giấy chi phối bố cục; so sánh các dạng trung đường, điều phúc và đẩu phương theo mẫu.',[
'Quan sát hình thức của từng mẫu, nơi trưng treo và quan hệ giữa vùng chính văn với lạc khoản. Không áp cùng một cách xếp chữ cho mọi khổ giấy.',
'Phác thảo các phương án trên khổ tương ứng, kiểm tra trục, khoảng trắng và vị trí ấn trước khi thực hiện bản luyện.'
],'Làm bài bức thức trung đường, điều phúc hoặc đẩu phương theo yêu cầu của lớp, kèm phác thảo bố cục.','Chương 15 - Bức thức, bồi biểu; Chương 14 - Chương pháp'],
[46,'Bức thức - Phiến diện','Phiến diện','Tìm hiểu cách tổ chức chữ trên mặt quạt, cân nhắc hình dáng mặt viết và hướng đọc để bố cục hài hoà.',[
'Quan sát dạng mặt quạt trong mẫu; xác định giới hạn vùng viết và cách các dòng phù hợp với hình dáng đó.',
'Phác thảo khoảng cách, cỡ chữ và vị trí lạc khoản, ấn; tránh làm nội dung chật ở vùng hẹp hoặc loãng ở vùng rộng.'
],'Thực hành bố cục phiến diện theo mẫu được giao.','Chương 15 - Bức thức; Chương 14 - Chương pháp'],
[47,'Bức thức - Hoành phi và Câu đối','Hoành phi - Câu đối','Phân tích hình thức bài ngang và cặp bài đối; giữ quan hệ nội dung, tỉ lệ và nhịp chữ giữa các phần.',[
'Với hoành phi, xác định trục ngang và vị trí trọng tâm. Với câu đối, đối chiếu nội dung, cỡ chữ và bố cục của hai vế theo mẫu.',
'Phác thảo chính văn, khoản và ấn cho từng bức; xem cả cặp hoặc bộ bài như một tổng thể trước khi viết.'
],'Thực hành bài hoành phi hoặc câu đối theo đề của lớp, kèm phác thảo bố cục.','Chương 15 - Bức thức; Chương 14 - Chương pháp; Chương 16 - Lạc khoản'],
[48,'Bức thức - Tứ bình và Sách hiệt','Tứ bình - Sách hiệt','Tập tổ chức tác phẩm gồm nhiều bức hoặc trang; xây dựng sự thống nhất về nội dung và trình bày giữa các phần.',[
'Đối chiếu mẫu để xác định thứ tự, mạch nội dung và quy luật cỡ chữ, khoảng cách. Lập bố cục tổng thể trước từng bức hoặc trang.',
'Kiểm tra tính thống nhất của kiểu chữ, nhịp và khoản giữa các phần; giữ điểm nhấn phù hợp thay vì lặp máy móc.'
],'Làm bài bố cục tứ bình hoặc sách hiệt theo mẫu, nộp hình tổng thể và các phần cần đối chiếu.','Chương 15 - Bức thức; Chương 14 - Chương pháp'],
[49,'Lạc khoản','Lạc khoản','Tìm hiểu nội dung và vị trí lạc khoản, phối hợp khoản với chính văn và ấn để hoàn thiện tác phẩm.',[
'Đối chiếu mẫu để phân biệt thông tin người nhận, người viết, thời gian hoặc địa điểm theo loại khoản được học.',
'Phác thảo vị trí, cỡ chữ và khoảng trắng của khoản. Kiểm tra quan hệ với chính văn và ấn, tránh để khoản lấn át nội dung chính.'
],'Thực hành một bài có lạc khoản theo yêu cầu của lớp, giải thích cách chọn vị trí và nội dung khoản.','Chương 16 - Ấn chương, lạc khoản'],
[50,'Chương pháp','Chương pháp','Tổng hợp cách tổ chức một tác phẩm: chính văn, hàng dòng, khoảng trắng, điểm nhấn, lạc khoản và ấn.',[
'Phân tích nội dung trước khi chia dòng và chọn bức thức. Phác thảo tổng thể để thử khoảng cách, mật độ và vị trí các thành phần.',
'Viết theo phương án đã chọn, đối chiếu nhịp chữ và cân bằng đen - trắng. Xem lại toàn bài để nhận xét thay vì chỉ nhìn từng nét.'
],'Thực hiện bài chương pháp theo đề của lớp, kèm phác thảo và nhận xét bố cục.','Chương 14 - Chương pháp; Chương 16 - Lạc khoản; Chương 18 - Sự cân bằng'],
[51,'Bát phong','Bát phong','Ôn tập các trạng thái phong bút trong hệ bài cơ bản công của Thư Môn và ứng dụng chúng vào việc phân tích, luyện nét.',[
'Dùng bảng mẫu bát phong của lớp để phân loại trạng thái đầu lông khi tiếp xúc giấy. Phân biệt bát phong với bát diện bút và cửu dụng.',
'Đối chiếu các nét đã học: lộ, tàng, trung và những trạng thái còn lại theo mẫu. Chỉ ra thao tác tạo nét và lỗi điều phong cần sửa.'
],'Luyện bài tổng hợp bát phong theo mẫu, kèm bảng nhận diện trạng thái của các nét.','Chương 9 - Cơ bản công, bát phong; Chương 7 - Dụng bút'],
[52,'Kiểm tra tốt nghiệp','Kiểm tra tốt nghiệp','Tổng hợp kỹ thuật, kết cấu, mặc sắc và bố cục đã học để thực hiện bài kiểm tra cuối khoá theo đề của giáo viên.',[
'Đọc kỹ đề, nội dung, mẫu và yêu cầu được công bố; chuẩn bị dụng cụ, chọn phương án bố cục và rà lại các kỹ thuật cần dùng.',
'Thực hiện bài bằng thao tác viết, chụp ảnh rõ toàn bài và các chi tiết theo yêu cầu. Nộp bài T52 chỉ xác nhận đã gửi, không tự suy ra đạt tốt nghiệp.'
],'Thực hiện và nộp bài kiểm tra tốt nghiệp theo đề, tiêu chí và thời hạn do giáo viên công bố.','Khung chương trình do giáo viên cung cấp; ôn tập các chương Dụng bút, Thức thế, Chương pháp và Lạc khoản']
];
LESSON_CONTINUATION.forEach(function(entry){var week=entry[0];LESSON_OVERRIDES[week]={title:'Tuần '+week+' - '+entry[1],shortTitle:'Tuần '+week+' - '+entry[2],available:true,description:entry[3],guide:entry[4],tasks:[entry[5],'Chụp ảnh bài làm và nộp qua trang nộp bài với mã T'+week+'.'],source:week===52?'Khung kiểm tra của lớp. Đề thi, tiêu chí chấm và thời hạn do giáo viên công bố.':'Khung học của lớp, tham khảo Thư pháp Việt - Cho người mới: '+entry[6]+'. Hướng dẫn và nhiệm vụ là nội dung biên soạn, không phải trích nguyên văn sách.'}});
var lessons=[];
for(var i=0;i<=52;i++){
var supplied=LESSON_OVERRIDES[i];
lessons.push(Object.assign({id:i,title:'Bài '+i,description:'Nội dung cụ thể của bài T'+i+' đang được cập nhật.',guide:[],tasks:['Thực hành bài tập theo hướng dẫn của buổi học.','Chụp ảnh bài luyện tập và gửi qua trang nộp bài với mã T'+i+'.'],code:'T'+i,submitUrl:'https://www.thudao.com/p/nop-bai.html',submitLabel:'Nộp bài T'+i,available:!!supplied},supplied||{}));
}
window.OCD_LESSONS_52=lessons;
})();
