// 填入店家 LINE 官方帳號，例如 @yourshop；留空時使用示範模式。
window.SHOP = { name: '日常選物', lineId: '' };
window.PRODUCTS = [
 {id:'NB01',name:'日常方格筆記本',category:'書寫文具',spec:'A5・霧藍 / 80 頁',price:180,stock:24,image:'',desc:'適合整理靈感、工作筆記與每日待辦。方格內頁，讓文字與手繪都自在。',tag:'人氣選物'},
 {id:'CP01',name:'晨光陶瓷馬克杯',category:'居家生活',spec:'奶油白 / 350 ml',price:420,stock:12,image:'',desc:'留一點時間給早晨的咖啡。簡約杯身與舒適握柄，陪伴每個日常片刻。',tag:'編輯推薦'},
 {id:'BG01',name:'輕日常帆布提袋',category:'隨身配件',spec:'原色 / 35 × 40 cm',price:320,stock:18,image:'',desc:'採買、上課或午後散步，都能輕鬆帶上。開放式袋口，拿取物品更方便。',tag:''},
 {id:'NB02',name:'隨行靈感筆記本',category:'書寫文具',spec:'A6・霧藍 / 48 頁',price:120,stock:8,image:'',desc:'放入口袋的小筆記本，隨時記下突然出現的靈感。',tag:''},
 {id:'CP02',name:'午後陶瓷咖啡杯',category:'居家生活',spec:'奶油白 / 250 ml',price:360,stock:0,image:'',desc:'剛剛好的容量，給午後一段小小的休息時間。此款目前暫時缺貨。',tag:''},
 {id:'BG02',name:'週末大容量帆布袋',category:'隨身配件',spec:'原色 / 42 × 45 cm',price:480,stock:6,image:'',desc:'多一點空間，裝下週末需要的物品。適合短程出門與日常採買。',tag:'少量現貨'}
];
const photos={NB:'images/notebook.jpg',CP:'images/mug.jpg',BG:'images/tote.jpg'};
window.PRODUCTS.forEach(p=>p.image=photos[p.id.slice(0,2)]);
