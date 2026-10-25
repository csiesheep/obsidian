from PIL import Image, ImageDraw, ImageFont

OUT = r"C:/Users/sheep/code/obsidian/Projects/auto promotion/schedule.png"
S = 2
W, LEFT, RIGHT = 2000, 190, 40
F = lambda sz, b=False: ImageFont.truetype(r"C:/Windows/Fonts/" + ("msjhbd.ttc" if b else "msjh.ttc"), sz * S)
C = {"tp": ("#9FE1CB", "#04342C"), "ts": ("#E1F5EE", "#085041"), "gp": ("#CECBF6", "#26215C"),
     "gs": ("#EEEDFE", "#3C3489"), "x": ("#D3D1C7", "#2C2C2A")}
t = lambda s: int(s[:2]) + int(s[3:]) / 60
lanes = [
    ("製作（GPU）", [("00:00", "24:00", "x", "promo-producer：每 2 小時檢查 → 分享卡 2 → Reel（沒存貨時優先）→ 貼文池 熱門 4＋日記 4 → Reel 2 → 鬼唱詩 2")]),
    ("小羊遊戲間", [("06:30", "07:25", "ts", "找文"), ("07:30", "07:55", "tp", "回覆"), ("08:00", "08:28", "tp", "熱門"),
                ("10:00", "10:55", "ts", "找文"), ("11:30", "11:58", "tp", "日記"), ("12:00", "13:00", "tp", "回覆"),
                ("13:30", "15:25", "tp", "回留言＋追蹤數"), ("16:30", "17:25", "ts", "找文"), ("17:30", "17:55", "tp", "分享卡"),
                ("18:30", "19:25", "tp", "Reel"), ("19:30", "19:55", "tp", "回覆"), ("20:00", "20:55", "tp", "熱門"),
                ("21:00", "21:15", "tp", "互動"), ("21:20", "21:57", "tp", "日記")]),
    ("鬼唱詩", [("00:00", "01:00", "gp", "故事"), ("05:00", "06:25", "gp", "故事"), ("09:00", "09:50", "gs", "找文"),
             ("13:00", "13:30", "gp", "回覆"), ("15:30", "16:20", "gs", "找文"), ("22:00", "23:15", "gp", "回覆"),
             ("23:20", "24:00", "gp", "故事")]),
    ("其他", [("01:10", "01:50", "x", "社群數據"), ("09:30", "10:00", "x", "週報（週日）")]),
]
TOP, LH, GAP = 120, 64, 30
H = TOP + len(lanes) * (LH + GAP) + 80
im = Image.new("RGB", (W * S, H * S), "white")
d = ImageDraw.Draw(im)
x = lambda h: (LEFT + (W - LEFT - RIGHT) * h / 24) * S
d.text((LEFT * S, 20 * S), "自動推廣一天的排程（台灣時間；2026-10-25 更新）", font=F(26, True), fill="#0b0b0b")
lx = LEFT
for k, lab in [("tp", "小羊遊戲間 發文"), ("ts", "小羊遊戲間 找文"), ("gp", "鬼唱詩 發文"), ("gs", "鬼唱詩 找文"), ("x", "製作／其他")]:
    d.rectangle([lx * S, 72 * S, (lx + 16) * S, 88 * S], fill=C[k][0], outline="#B4B2A9", width=S)
    d.text(((lx + 24) * S, 68 * S), lab, font=F(16), fill="#52514e")
    lx += 48 + int(d.textlength(lab, font=F(16)) / S)
for h in range(0, 25):
    d.line([x(h), (TOP - 6) * S, x(h), (TOP + len(lanes) * (LH + GAP) - GAP) * S],
           fill="#E4E2DA" if h % 3 == 0 else "#F2F1EC", width=S)
for i, (name, bars) in enumerate(lanes):
    y0 = TOP + i * (LH + GAP)
    d.rounded_rectangle([x(0), y0 * S, x(24), (y0 + LH) * S], 8 * S, fill="#F7F6F2")
    d.text((16 * S, (y0 + LH / 2) * S), name, font=F(18, True), fill="#2C2C2A", anchor="lm")
    flip = 0
    for a, b, k, lab in bars:
        x0, x1 = x(t(a)) + S, x(t(b)) - S
        d.rounded_rectangle([x0, (y0 + 8) * S, x1, (y0 + LH - 8) * S], 6 * S, fill=C[k][0],
                            outline="#5DCAA5" if k == "ts" else "#AFA9EC" if k == "gs" else None, width=S)
        f = F(15)
        if d.textlength(lab, font=f) + 10 * S < x1 - x0:
            d.text(((x0 + x1) / 2, (y0 + LH / 2) * S), lab, font=f, fill=C[k][1], anchor="mm")
        else:
            above = flip % 2 == 0
            ly = (y0 - 3) if above else (y0 + LH + 3)
            d.text(((x0 + x1) / 2, ly * S), lab, font=F(13), fill=C[k][1], anchor="mb" if above else "mt")
            flip += 1
    if name == "其他":
        for h in range(24):
            hx = x(h + 7 / 60)
            d.line([hx, (y0 + 20) * S, hx, (y0 + LH - 20) * S], fill="#888780", width=2 * S)
yb = TOP + len(lanes) * (LH + GAP) - GAP
for h in range(0, 25):
    big = h % 3 == 0
    d.text((x(h), (yb + 8) * S), f"{h:02d}", font=F(15 if big else 12), fill="#2C2C2A" if big else "#898781", anchor="ma")
    if big:
        d.text((x(h), (yb + 34) * S), f"{(h + 9) % 24:02d}", font=F(13), fill="#898781", anchor="ma")
d.text((16 * S, (yb + 8) * S), "台灣時間", font=F(15), fill="#52514e")
d.text((16 * S, (yb + 34) * S), "PDT（11/1 後減 1）", font=F(13), fill="#898781")
d.text((16 * S, (yb + 70) * S),
       "熱門＝熱門遊戲介紹、日記＝開發日記（Threads＋IG＋FB）；互動＝一三五留言生日投胎、二四六數據小知識；其他：每小時 :07 遊戲數據報告、01:10 兩個帳號各平台前一天數字。兩個品牌用 Chrome 的時段不重疊。",
       font=F(14), fill="#52514e")
im = im.resize((W, H), Image.LANCZOS)
im.save(OUT)
print(OUT, im.size)
