-- 可選：在 schema.sql 之後執行，匯入六件示範商品，不覆蓋已有資料。
insert into public.catalog_products(id,name,category,spec,description,price,stock,image,tag,is_active,sort_order)
values
('NB01','日常方格筆記本','書寫文具','A5・霧藍 / 80 頁','適合整理靈感、工作筆記與每日待辦。方格內頁，讓文字與手繪都自在。',180,24,'images/notebook.jpg','人氣選物',true,1),
('CP01','晨光陶瓷馬克杯','居家生活','奶油白 / 350 ml','留一點時間給早晨的咖啡。簡約杯身與舒適握柄，陪伴每個日常片刻。',420,12,'images/mug.jpg','編輯推薦',true,2),
('BG01','輕日常帆布提袋','隨身配件','原色 / 35 × 40 cm','採買、上課或午後散步，都能輕鬆帶上。',320,18,'images/tote.jpg','',true,3),
('NB02','隨行靈感筆記本','書寫文具','A6・霧藍 / 48 頁','放入口袋的小筆記本，隨時記下突然出現的靈感。',120,8,'images/notebook.jpg','',true,4),
('CP02','午後陶瓷咖啡杯','居家生活','奶油白 / 250 ml','剛剛好的容量，給午後一段小小的休息時間。',360,0,'images/mug.jpg','',true,5),
('BG02','週末大容量帆布袋','隨身配件','原色 / 42 × 45 cm','多一點空間，裝下週末需要的物品。',480,6,'images/tote.jpg','少量現貨',true,6)
on conflict (id) do nothing;
