# Claude Taiwan：介紹小羊遊戲間（短版，2026-11-03）

這 6 天用 Claude Code 做了一個網頁小遊戲大廳～
小羊遊戲間 👉 https://games.csiesheep.com/
像滑短影音一樣往下滑，點了就玩，收了 1,500 多款、1,300 多位作者的作品。

6 天、427 個 commit、221 條驗收全綠，
我自己沒寫半行產品程式碼 XD

怎麼做的？
・主 session 只當 orchestrator：開 issue、寫 brief、驗收、merge
・實作派給 FE／BE／writer／artist／chore 五種 subagent，各自在自己的 git worktree
・驗收先寫好，而且要故意把產品弄壞，確認測試真的會紅
・每款遊戲都用 headless Chrome 開，手機、電腦各判一次，最後我一款一款按上架

最大的心得：
AI 寫的測試很常「永遠是綠的」，
看起來有在檢查，其實一筆資料都沒看 orz
所以現在每條檢查都要先證明它「紅得起來」。

有在做網頁小遊戲的，歡迎丟連結給我收進來～
有錯請指正 :p

6 days, 427 commits, zero lines of product code written by me. The hard part was making sure the AI's tests could actually fail.

#ClaudeCode #測試綠的不一定是好事 #我只負責按上架
