# HEARTBEAT.md - 自动任务

## 每日同步

每天凌晨 2 点自动执行以下任务：

1. **同步到 GitHub** - 推送最新代码
2. **清理临时文件** - 删除不必要的临时文件

---

## 执行逻辑

- 如果收到 "daily-save" 消息：
  1. `git add .`
  2. `git commit -m "Auto backup - [日期]"`
  3. `git push origin master`

---

## 调度时间

- **每天 02:00** (Asia/Shanghai)
- 可在 Gateway 中调整 `cron list` 查看
