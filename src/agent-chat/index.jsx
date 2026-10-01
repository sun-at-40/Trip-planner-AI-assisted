import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArrowUp, Bot, LoaderCircle, UserRound } from 'lucide-react'
import PropTypes from 'prop-types'
import remarkGfm from 'remark-gfm'

const API_BASE_URL = (import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const SECTION_HEADING = /^(?:quick\s+overview|overview|weather\b|recommended\s+(?:accommodation|hotels|restaurants|places)|dining\b|itinerary\b|daily\s+plan\b|places\s+to\s+visit|activities\b|transport(?:ation)?\b|getting\s+around\b|(?:estimated\s+)?cost\b|budget\b|expenses\b)/i

function splitAnswerSections(content) {
  const headingPattern = /^(#{1,6})[ \t]+(.+?)\s*#*\s*$/gm
  const headings = [...content.matchAll(headingPattern)]
  if (headings.length < 2) return null

  const firstHeadingText = headings[0][2].trim()
  const hasTitle = !SECTION_HEADING.test(firstHeadingText)
  const firstSectionIndex = hasTitle ? 1 : 0
  const firstSectionHeading = headings[firstSectionIndex]
  const introStart = hasTitle ? headings[0].index + headings[0][0].length : 0
  const intro = content.slice(introStart, firstSectionHeading.index).trim()
  const sections = headings.slice(firstSectionIndex).map((heading, index) => {
    const bodyStart = heading.index + heading[0].length
    const nextHeading = headings[firstSectionIndex + index + 1]

    return {
      title: heading[2].trim(),
      content: content.slice(bodyStart, nextHeading?.index ?? content.length).trim(),
    }
  })

  return {
    title: hasTitle ? firstHeadingText : null,
    intro,
    sections,
  }
}

function AgentAnswer({ content, idPrefix }) {
  const answer = splitAnswerSections(content)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!answer) {
    return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  }

  const activeSection = answer.sections[activeIndex]

  return (
    <div className="agent-answer">
      {answer.title && <h2 className="agent-answer-title">{answer.title}</h2>}
      {answer.intro && (
        <div className="agent-answer-intro">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer.intro}</ReactMarkdown>
        </div>
      )}
      <div className="agent-answer-tabs" role="tablist" aria-label="Trip plan sections">
        {answer.sections.map((section, index) => (
          <button
            aria-controls={`${idPrefix}-panel`}
            aria-selected={index === activeIndex}
            className={`agent-answer-tab${index === activeIndex ? ' active' : ''}`}
            id={`${idPrefix}-tab-${index}`}
            key={`${section.title}-${index}`}
            onClick={() => setActiveIndex(index)}
            role="tab"
            type="button"
          >
            {section.title}
          </button>
        ))}
      </div>
      <section
        aria-labelledby={`${idPrefix}-tab-${activeIndex}`}
        className="agent-answer-panel"
        id={`${idPrefix}-panel`}
        role="tabpanel"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeSection.content}</ReactMarkdown>
      </section>
    </div>
  )
}

AgentAnswer.propTypes = {
  content: PropTypes.string.isRequired,
  idPrefix: PropTypes.string.isRequired,
}

function AgentChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi, I’m your travel agent. Where would you like to explore?' },
  ])
  const [question, setQuestion] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const prompt = question.trim()
    if (!prompt || sending) return

    setQuestion('')
    setMessages((current) => [...current, { role: 'user', content: prompt }])
    setSending(true)

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt }),
      })
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.detail || `Request failed (${response.status})`)
      }
      if (typeof result.answer !== 'string') {
        throw new Error('The travel service returned an unexpected response.')
      }

      setMessages((current) => [...current, { role: 'assistant', content: result.answer }])
    } catch (error) {
      setMessages((current) => [...current, {
        role: 'assistant',
        content: `I couldn’t complete that request: ${error.message}`,
        isError: true,
      }])
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="agent-chat-page page-frame">
      <header className="agent-chat-heading">
        <p className="eyebrow"><Bot size={15} /> YOUR TRAVEL AGENT</p>
        <h1>Let’s plan something memorable.</h1>
      </header>

      <section className="agent-chat-panel" aria-label="Travel agent conversation">
        <div className="agent-chat-messages" role="log" aria-live="polite">
          {messages.map((message, index) => (
            <article
              className={`agent-message ${message.role}${message.isError ? ' error' : ''}`}
              key={`${message.role}-${index}`}
            >
              <span className="agent-message-icon" aria-hidden="true">
                {message.role === 'assistant' ? <Bot size={17} /> : <UserRound size={17} />}
              </span>
              <div className="agent-message-content">
                {message.role === 'assistant'
                  ? <AgentAnswer content={message.content} idPrefix={`agent-message-${index}`} />
                  : message.content}
              </div>
            </article>
          ))}
          {sending && (
            <div className="agent-chat-loading" role="status">
              <LoaderCircle size={17} /> Planning your answer...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="agent-chat-composer" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="agent-chat-prompt">Message your travel agent</label>
          <textarea
            id="agent-chat-prompt"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Ask about a destination, itinerary, or travel costs..."
            rows={2}
            maxLength={3000}
            disabled={sending}
          />
          <button type="submit" aria-label="Send message" title="Send message" disabled={sending || !question.trim()}>
            <ArrowUp size={19} />
          </button>
        </form>
      </section>
    </main>
  )
}

export default AgentChat