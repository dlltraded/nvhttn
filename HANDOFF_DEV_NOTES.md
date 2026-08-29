# Bàn giao kỹ thuật — Landing page "Lớp Rèn luyện Kỹ năng 2026-2027" (NVHTTN)

Tài liệu này ghi lại toàn bộ những gì đã thay đổi trong đợt làm việc gần nhất, để đội dev rà soát, review code và tiếp tục hoàn thiện. Viết theo thứ tự: kiến trúc tổng quan → những gì đã sửa/thêm → bug đã phát hiện & vá → việc còn tồn đọng cần dev xử lý tiếp → trạng thái git/deploy.

---

## 1. Kiến trúc & phạm vi 2 dự án liên quan

Có **2 repo GitHub** dùng chung 1 project Supabase:

| Repo | Đường dẫn local | Remote |
|---|---|---|
| Landing page NVH | `E:\NVHTTN\landing-page-ky-nang-he` | `https://github.com/dlltraded/nvhttn.git` (deploy qua Vercel) |
| Website chính HVE | `E:\HUYVOEDUCATION\huyvoeducation-website` | `https://github.com/dlltraded/huyvoeducation.git` |

Cả 2 cùng ghi dữ liệu đăng ký vào **1 bảng `leads`** trong cùng 1 Supabase project (không tách database riêng), để dùng chung hệ thống mã giới thiệu (referral code) đã có sẵn bên HVE.

### File chính trong repo NVHTTN
- `index.html` — landing page chính (hero, form nhanh, chương trình học, học phí, ưu đãi, form đăng ký chi tiết, FAQ/steps, footer, popup khuyến mãi)
- `dang-ky.html` — trang đăng ký chi tiết riêng (được team dev một session khác xây dựng độc lập trước đó, có form/CSS khác `index.html`)
- `thank-you.html` — trang cảm ơn sau khi gửi form
- `privacy-policy.html` — trang chính sách bảo mật (mới thêm)
- `vercel.json` — cấu hình deploy

Cả 4 file HTML đều **tự chứa (self-contained)** — không có build step, không framework, CSS/JS đều inline trong từng file. Đây là điểm cần lưu ý cho dev: sửa nội dung ở đâu thì phải sửa lặp lại ở file khác nếu nội dung đó (địa chỉ, số điện thoại, môn học...) xuất hiện ở cả 2 nơi.

---

## 2. Những gì đã thực hiện trong đợt này

### 2.1. Thu hẹp phạm vi từ 7 môn xuống đúng 4 môn
Trước đó, `index.html` bị tự mâu thuẫn nội bộ: phần hero nói "4 môn" nhưng stats bar, tiêu đề mục chương trình học, và form đăng ký lại hiển thị/cho chọn 7 môn (thêm Hội họa, Nhảy hiện đại, MC, và banner CLB Tiếng Anh miễn phí). Đã đồng bộ toàn bộ về đúng 4 môn: **Bóng đá, Bóng rổ, Bơi lội, Robotics & AI** — áp dụng cho cả `index.html` và `dang-ky.html` (title, meta description, OG/Twitter tags, hero, stats bar, thẻ môn học, checkbox form, i18n dictionary).

### 2.2. Vá lỗi kỹ thuật nghiêm trọng (đã xảy ra trước đợt sửa này)
1. **Crash JS toàn trang ở `dang-ky.html`**: nếu script `supabase-js` từ CDN load chậm/bị chặn (mạng yếu, ad-blocker — rất phổ biến với traffic từ quảng cáo), dòng `const { createClient } = supabase;` sẽ ném lỗi ngay khi trang load, làm hỏng toàn bộ JS phía sau (form, đổi ngôn ngữ...). `index.html` đã có sẵn cơ chế try/catch bảo vệ, nhưng `dang-ky.html` (được xây dựng độc lập) thì chưa. → Đã thêm try/catch tương tự.
2. **Sai tên cột khi insert Supabase ở `dang-ky.html`**: code cũ insert với tên cột `subjects` (string nối bằng dấu phẩy), `package`, `after1630` — những cột này **không tồn tại** trong schema thật (`programs` là mảng, `package_selected`, `wants_after_1630`). Nếu không sửa, **mọi lượt đăng ký qua `dang-ky.html` sẽ âm thầm thất bại** (form chỉ hiện lỗi chung, không ai biết vì sao). → Đã đồng bộ đúng tên cột.
3. Vài chỗ lặp số điện thoại do copy-paste lỗi (VD: "...hoặc 0769.663366 hoặc 0769.663366") — đã dọn lại.
4. Lỗi HTML: khi xoá 3 thẻ môn thừa (Vẽ/Nhảy/MC) trong lưới `.program-grid`, script dọn dẹp tự động đã ăn nhầm luôn 1 thẻ `</div>` đóng khung lưới, làm phần "Rèn luyện kỹ năng sống mỗi ngày" và các phần sau bị vỡ bố cục (chữ bị bóp dồn từng chữ một). → Đã phát hiện qua feedback hình ảnh của anh Kenny và vá lại.

### 2.3. Tính năng mới thêm vào `index.html`
- **Form nhanh 3 trường** ngay trong hero (Tên phụ huynh, SĐT, Trường học) — mục tiêu giảm ma sát cho traffic từ quảng cáo, giữ form chi tiết ở phía dưới cho ai muốn điền đầy đủ ngay.
- **Nút gọi nổi (floating call button)** hiện trên mobile (≤760px), bấm gọi thẳng hotline.
- **Danh sách rõ tên 8 trường** thuộc tuyến xe gần (trước đó chỉ ghi chung "08 trường").
- **Nội dung SEO** viết lại theo bộ từ khoá Google Ads đã duyệt (nhóm A/B/C/D/E/F/K — bỏ nhóm G/H/I/J vì thuộc 3 môn ngoài phạm vi hiện tại), dệt tự nhiên vào mô tả từng môn + đoạn giới thiệu tổng quan.
- **Google Maps embed** theo địa chỉ chính thức 159 Cách Mạng Tháng 8, phường Trấn Biên, Đồng Nai.
- **Trang `privacy-policy.html`** mới, link từ footer + từ `dang-ky.html`.
- **Scaffold Google Ads Conversion Tracking** (đang comment sẵn, cần Conversion ID/Label thật từ Google Ads mới kích hoạt — xem mục 4).
- **Gắn nguồn lead (`source`, `site`)**: mỗi form (form nhanh, form chi tiết trên `index.html`, form trên `dang-ky.html`) ghi 1 giá trị `source` riêng biệt để phân biệt kênh, cộng thêm cột `site='nvhttn'` cố định trên mọi lead từ dự án này — để tách khỏi lead của HVE dù có mã giới thiệu hay không.

### 2.4. Thông tin liên hệ đã cập nhật theo xác nhận mới nhất
- Hotline: **0251.3847369 · 0769.663366** (áp dụng toàn bộ 4 file HTML, gồm cả link `tel:`)
- Địa chỉ: **159 Cách Mạng Tháng 8, phường Trấn Biên, Đồng Nai**
- Chính sách ưu đãi CBCNV: giữ nguyên theo đúng văn bản 195/TB-NVHTTN-CTTN (đã đối chiếu, khớp)

### 2.5. Admin quản lý lead (repo HVE — `src/pages/admin/LeadsManager.tsx`)
- Thêm badge "NVHTTN" hiện ngay ngoài danh sách lead (không cần mở rộng mới thấy) cho lead có `site='nvhttn'`.
- Thêm bộ lọc "Nguồn website": Tất cả / HVE / NVHTTN, có đếm số lead theo từng nhóm.
- Query Supabase (`select('*')`) không đổi — không cần sửa gì thêm để cột `site` tự động trả về sau khi chạy migration.

---

## 3. Việc BẮT BUỘC trước khi chạy quảng cáo

1. **Chạy migration SQL** `supabase/migrations/20260825_nvh_summer_skills_landing.sql` trên Supabase SQL Editor (chưa chạy tính đến thời điểm viết tài liệu này). Thiếu bước này thì các trường riêng của NVH (trường học, gói học, cờ giảm giá, cột `site`) sẽ bị rơi mất khi insert (form vẫn chạy được nhờ cơ chế fallback, không crash, nhưng dữ liệu không đầy đủ).
2. **Điền Conversion ID/Label thật cho Google Ads** vào khối script đang comment ở đầu `<head>` của `index.html` và `dang-ky.html` (tìm comment `CONVERSION TRACKING`), đổi `NVH_TRACKING_READY` thành `true`. Facebook không cần Pixel vì thu lead riêng qua Lead Ads.
3. **`git push`** cả 2 repo — hiện tại mọi thay đổi mới chỉ nằm ở local, chưa đẩy lên GitHub/Vercel (không có credential GitHub trong môi trường thao tác nên phải push thủ công từ máy).

---

## 4. Việc CÒN TỒN ĐỌNG — gợi ý cho đội dev tiếp tục

Đây là các hạng mục trong checklist tối ưu chuyển đổi (từ file kế hoạch chiến dịch) **chưa làm** hoặc mới làm sơ bộ, cần dev review/hoàn thiện thêm:

- **Popup "Ưu đãi độc quyền"**: hiện tại delay 3.5s sau khi vào trang, hiện 1 lần/phiên (`sessionStorage`) — dev nên đánh giá lại có nên đổi sang kiểu exit-intent (chỉ hiện khi người dùng có ý định rời trang) để đỡ gây khó chịu, đúng tinh thần khuyến nghị "không dùng popup toàn màn hình chặn ngay khi vào trang" trong kế hoạch chiến dịch.
- **`dang-ky.html`** là 1 trang được xây độc lập, dùng bộ CSS/biến màu khác `index.html` (`--navy`, `--gold`... thay vì `--navy-900`, `--gold-500`...). Nên cân nhắc hợp nhất design system giữa 2 file để dễ bảo trì lâu dài, tránh phải sửa 2 nơi mỗi khi đổi nội dung.
- **`dang-ky.html`** thiếu capture `?src=`/`utm_source=` (mới có `?ref=`) — đã bổ sung trong đợt sửa lần này nhưng dev nên double-check hoạt động đúng khi có traffic thật.
- File `.bak_*` (backup tự động) đang nằm trong thư mục dự án (`index.html.bak_...`, `dang-ky.html.bak_...`) — **không** được add vào git, dev có thể xoá khi không cần đối chiếu nữa.
- Cân nhắc thêm cảnh báo/rào chắn để form không cho gửi trùng lặp nhanh (debounce) nếu người dùng bấm nút gửi nhiều lần.
- Trang `privacy-policy.html` là bản nháp đầu tiên — nên có luật sư/người phụ trách pháp lý của đơn vị rà lại nội dung trước khi công bố chính thức, đặc biệt phần thời gian lưu trữ dữ liệu và quyền của phụ huynh.
- Google Ads keyword file (`BOTUKHOAGOOGLEADS.xlsx`) có 16 từ khoá (nhóm G/H/I/J: Hội họa, Nhảy hiện đại, MC, CLB Tiếng Anh) không còn phù hợp phạm vi 4 môn hiện tại — cần loại khỏi chiến dịch Ads cho tới khi các môn này (nếu có) được mở lại.

---

## 5. Trạng thái Git tại thời điểm bàn giao

**Repo NVHTTN** — 2 commit mới trên `main`, local đã sẵn sàng, **cần `git push`**:
```
86f8f4d Fix: lấy lại thẻ đóng </div> bị mất của .program-grid, gây vỡ bố cục phần kỹ năng sống
6ae8573 Thu hẹp lại đúng 4 môn năng khiếu, thêm form nhanh, nút gọi mobile, SEO nội dung, chính sách bảo mật
```
File thay đổi: `index.html`, `dang-ky.html`, `thank-you.html`, `privacy-policy.html` (mới).

**Repo HVE** — 1 commit mới trên `main`, local đã sẵn sàng, **cần `git push`** (chỉ đúng 2 file, không đụng các file khác team đang code dở):
```
2ab16a2 Thêm bộ lọc + badge nguồn website (site) cho admin quản lý lead
```
File thay đổi: `src/pages/admin/LeadsManager.tsx`, `supabase/migrations/20260825_nvh_summer_skills_landing.sql`.

> Lưu ý: repo HVE tại thời điểm bàn giao có **~34 file khác đang sửa dở, chưa commit** (Header, Footer, Hero, ProgramsSection, RegistrationForm, sitemap.xml...) — không thuộc phạm vi đợt làm việc này, đội dev tự quản lý phần đó.

### 5.1. Việc đội dev cần push lên GitHub — checklist thao tác

**Repo NVHTTN** — chỉ cần push (2 commit đã có sẵn, không cần commit thêm gì):
```
cd E:\NVHTTN\landing-page-ky-nang-he
git push
```
Sau khi push, Vercel sẽ tự động deploy lên `nvhthanhthieunhidongnai.com`. **Nên đối chiếu bản local với bản live một lần trước khi rời khỏi máy**, đề phòng deploy tự động thất bại (log deploy xem trên Vercel dashboard).

**Repo HVE** — cũng chỉ cần push, nhưng đọc kỹ trước vì repo đang có nhiều thay đổi song song:
```
cd E:\HUYVOEDUCATION\huyvoeducation-website
git push
```
Lệnh này **chỉ đẩy 1 commit đã có sẵn** (`2ab16a2`, gồm đúng 2 file `LeadsManager.tsx` và migration SQL) — git push không đụng tới 34 file đang sửa dở còn lại (chúng vẫn ở trạng thái "chưa commit" trong working directory, hoàn toàn tách biệt). Đội dev **không nên** chạy `git add -A` hay `git commit -a` trước khi rà soát kỹ 34 file kia — làm vậy sẽ vô tình gộp code dở dang của người khác vào cùng 1 lần push.

**Nếu đội dev muốn kiểm tra lại trước khi push** (khuyến nghị):
```
git log --oneline -5          # xem commit nào sắp được đẩy lên
git show --stat HEAD          # xem đúng những file nào thay đổi trong commit mới nhất
git diff origin/main..HEAD    # xem toàn bộ nội dung sẽ được đẩy lên, so với bản đang live trên GitHub
```

**Sau khi migration Supabase đã chạy và Conversion ID/Label Google Ads đã điền thật** (mục 3), nếu đội dev có sửa thêm `index.html`/`dang-ky.html` để bật tracking, nhớ commit riêng 1 commit mới (đừng amend commit cũ) rồi push tiếp — không cần làm gì thêm ở phía Vercel, tự động deploy lại.

## 6. Cập nhật văn phong nội dung — 29/08/2026 (CHƯA COMMIT, cần rà soát + commit + push)

Theo yêu cầu của anh Kenny, đã rà soát và chỉnh lại một số câu chữ trong `index.html` và `dang-ky.html` nghe máy móc/dịch Tây, đổi sang giọng tự nhiên hơn, gần với cách nói chuyện thật của Nhà Văn hóa với phụ huynh. Đã sửa **cả trong đối tượng `I18N` (JS) lẫn trong HTML tĩnh** ở những chỗ có hardcode sẵn, để không bị lệch giữa 2 nơi.

**index.html:**

| Khóa i18n | Trước | Sau |
|---|---|---|
| `qf.h4` | Để lại số, Nhà Văn hóa gọi tư vấn ngay | Để lại số điện thoại, Nhà Văn hóa gọi lại tư vấn ngay cho ba mẹ |
| `qf.sub` | Chỉ mất 15 giây — không cần điền chi tiết ngay bây giờ. | Ba mẹ chưa cần nhớ hết chi tiết đâu — cứ để lại số, tụi em gọi tư vấn kỹ hơn. |
| `qf.okH` | Đã ghi nhận! | Cảm ơn ba mẹ! |
| `qf.okP` | Nhà Văn hóa sẽ gọi lại trong thời gian sớm nhất. | Nhà Văn hóa sẽ gọi lại cho ba mẹ trong ngày hôm nay. |
| `qf.errorRequired` | Vui lòng điền đầy đủ 3 thông tin trên. | Ba mẹ điền giúp em đủ 3 mục ở trên nhé. |
| `form.errorGeneric` | Có lỗi xảy ra, vui lòng thử lại hoặc gọi... | Hệ thống đang bận một chút, ba mẹ thử lại hoặc gọi trực tiếp giúp em nhé: ... |
| `ops.note` | Việc đưa, đón, bàn giao học sinh được điểm danh và xác nhận giữa nhà trường, người đưa đón, NVHTTN và phụ huynh ở mọi mốc chuyển giao. | Mỗi lượt đưa đón đều được điểm danh và xác nhận giữa nhà trường, người đưa đón, Nhà Văn hóa và phụ huynh — đảm bảo an toàn cho bé ở từng chặng. |
| `cta.h2` | Chỗ học có giới hạn theo từng tuyến xe | Mỗi tuyến xe đưa đón chỉ nhận số lượng có hạn |
| `footer.poweredBy` | Vận hành đăng ký cùng hệ thống Huy Võ Education | Hệ thống ghi danh được phối hợp vận hành cùng Huy Võ Education |

**dang-ky.html:**

| Khóa i18n | Trước | Sau |
|---|---|---|
| `err.generic` | Có lỗi xảy ra, vui lòng thử lại hoặc gọi... | Hệ thống đang bận một chút, ba mẹ thử lại hoặc gọi trực tiếp giúp em nhé: ... |
| `err.required` | Vui lòng điền đầy đủ thông tin bắt buộc. | Ba mẹ điền giúp em đầy đủ các mục có dấu * nhé. |

Đã kiểm tra: object `I18N` trong `index.html` vẫn parse hợp lệ (213 khóa, không lỗi cú pháp), chụp màn hình khu vực form nhanh + hero bằng Playwright xác nhận chữ mới hiển thị đúng, không tràn khung, không lỗi JS console.

**Đội dev cần làm:** `git add index.html dang-ky.html` (đúng 2 file này), review diff (`git diff --cached`), commit riêng (ví dụ: `Chỉnh văn phong nội dung tự nhiên hơn cho form nhanh, thông báo lỗi, footer, CTA`), rồi push — không gộp chung với các thay đổi khác đang dở dang trong repo NVHTTN (nếu có).

---

*Tài liệu tạo tự động, phục vụ bàn giao nội bộ — cập nhật lần cuối theo phiên làm việc gần nhất.*
