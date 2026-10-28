import type { BlogPost } from '../posts'

const post: BlogPost = {
  id: 'vue-state-design',
  title: 'Vue 3 状态设计的三个层次',
  date: '2026-06-06',
  summary: '从组件内部状态、页面组合状态到跨页面共享状态，整理一套更容易维护的 Vue 3 状态拆分方法。',
  tags: ['Vue 3', 'Frontend', 'Architecture'],
  readingTime: '5 min',
  content: [
    '写 Vue 3 应用时，状态不应该一开始就被塞进全局 store。更舒服的方式，是先判断状态的生命周期和使用范围。',
    '组件内部状态适合放在 ref 或 reactive 中，比如表单输入、展开收起、临时 loading。页面组合状态适合由页面组件管理，再通过 props 和事件分发给子组件。',
    '只有真正跨页面、跨流程、需要长期存在的状态，才值得进入全局层。这个边界越清楚，后续调试和重构就越轻松。',
  ],
}

export default post
