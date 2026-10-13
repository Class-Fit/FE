import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bot, Plus, Send } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrentMember } from '../../auth/hooks/useCurrentMember'
import { backendOrigin } from '../../../shared/api/backendOrigin'
import { CourseCard } from '../../courses/components/CourseCard'
import { InBodyPhotoPanel } from '../../inbody/components/InBodyPhotoPanel'
import { createConversation, getConversations, getMessages, sendMessage, type ChatMessage } from '../api/chatApi'
import styles from './ChatPage.module.css'

function Message({ message }: { message: ChatMessage }) {
  return <article className={`${styles.message} ${message.role === 'USER' ? styles.userMessage : styles.assistantMessage}`}>
    <strong>{message.role === 'USER' ? '나' : 'ClassFit AI'}</strong>
    <p>{message.content}</p>
    {message.recommendation && <>
      {message.recommendation.sportOptions?.length > 0 && <ul className={styles.sports}>
        {message.recommendation.sportOptions.map((option) => <li key={option.sportName}><strong>{option.sportName}</strong> {option.reason}</li>)}
      </ul>}
      {message.recommendation.courses?.length > 0 && <div className={styles.recommendedCourses}>
        {message.recommendation.courses.map((course) => <CourseCard key={course.courseId} course={course} />)}
      </div>}
    </>}
  </article>
}

export function ChatPage() {
  const member = useCurrentMember()
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const conversations = useQuery({ queryKey: ['chat', 'conversations'], queryFn: getConversations, enabled: !!member.data })
  const activeId = selectedId ?? conversations.data?.[0]?.conversationId ?? null
  const messages = useQuery({ queryKey: ['chat', 'messages', activeId], queryFn: () => getMessages(activeId!), enabled: !!member.data && activeId !== null })

  const create = useMutation({
    mutationFn: createConversation,
    onSuccess: async (conversation) => {
      setSelectedId(conversation.conversationId)
      await queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })
  const send = useMutation({
    mutationFn: (content: string) => sendMessage(activeId!, content),
    onSuccess: async () => {
      setDraft('')
      await queryClient.invalidateQueries({ queryKey: ['chat', 'messages', activeId] })
      await queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] })
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const content = draft.trim()
    if (activeId !== null && content && !send.isPending) send.mutate(content)
  }

  async function recommendFromInBody() {
    const conversationId = activeId ?? (await create.mutateAsync()).conversationId
    await sendMessage(conversationId, '방금 저장한 최신 인바디 수치를 바탕으로 내게 맞는 운동 종목과 강좌를 추천해줘.')
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] }),
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] }),
      queryClient.invalidateQueries({ queryKey: ['home'] }),
    ])
  }

  if (member.isPending) return <p role="status">로그인 상태를 확인하는 중입니다.</p>
  if (member.isError) return <div role="alert">로그인 상태를 확인하지 못했습니다. <button type="button" onClick={() => member.refetch()}>다시 시도</button></div>
  if (!member.data) return <section className={styles.gate}>
    <Bot aria-hidden="true" size={36} />
    <h1>AI 운동 추천</h1>
    <p>카카오 로그인 후 운동 목표와 관심 지역을 이야기해 주세요.</p>
    <a href={`${backendOrigin || ''}/oauth2/authorization/kakao`}>카카오 로그인</a>
  </section>

  return <section className={styles.page}>
    <header className={styles.header}><div><span>CLASSFIT AI</span><h1>AI 운동 추천</h1><p>원하는 운동과 지역을 이야기하면 강좌를 함께 찾아드려요.</p></div></header>
    <InBodyPhotoPanel onSaved={recommendFromInBody} />
    <div className={styles.layout}>
      <aside className={styles.sidebar} aria-label="대화 목록">
        <button type="button" onClick={() => create.mutate()} disabled={create.isPending}><Plus aria-hidden="true" size={18} /> 새 대화</button>
        {conversations.isPending && <p>대화 목록을 불러오는 중입니다.</p>}
        {conversations.isError && <p role="alert">대화 목록을 불러오지 못했습니다. <button type="button" onClick={() => conversations.refetch()}>다시 시도</button></p>}
        {create.isError && <p role="alert">대화를 만들지 못했습니다. 다시 시도해주세요.</p>}
        <ul>{conversations.data?.map((conversation) => <li key={conversation.conversationId}>
          <button type="button" className={conversation.conversationId === activeId ? styles.selected : ''} onClick={() => setSelectedId(conversation.conversationId)}>{conversation.title}</button>
        </li>)}</ul>
      </aside>
      <div className={styles.chat}>
        <div className={styles.transcript} aria-live="polite">
          {activeId === null && <div className={styles.empty}><Bot aria-hidden="true" size={32} /><h2>새 대화를 시작해 보세요</h2><p>예: 원주에서 주말에 할 수 있는 수영 강좌를 추천해줘</p></div>}
          {messages.isPending && activeId !== null && <p role="status">메시지를 불러오는 중입니다.</p>}
          {messages.isError && <div role="alert">메시지를 불러오지 못했습니다. <button type="button" onClick={() => messages.refetch()}>다시 시도</button></div>}
          {messages.data?.length === 0 && <p className={styles.empty}>어떤 운동을 찾고 계신가요?</p>}
          {messages.data?.map((message) => <Message key={message.messageId} message={message} />)}
          {send.isPending && <p role="status">추천을 준비하는 중입니다. 잠시 기다려 주세요.</p>}
        </div>
        {send.isError && <p className={styles.error} role="alert">메시지를 보내지 못했습니다. 내용을 확인하고 다시 전송해 주세요.</p>}
        <form className={styles.composer} onSubmit={submit}>
          <label htmlFor="chat-message">메시지</label>
          <textarea id="chat-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={4000} disabled={activeId === null || send.isPending} placeholder={activeId === null ? '새 대화를 먼저 만들어 주세요' : '운동 목표, 지역, 가능한 요일을 알려주세요'} />
          <button type="submit" disabled={activeId === null || !draft.trim() || send.isPending}><Send aria-hidden="true" size={17} /> 전송</button>
        </form>
        <Link className={styles.searchLink} to="/courses">직접 강좌 검색하기</Link>
      </div>
    </div>
  </section>
}
