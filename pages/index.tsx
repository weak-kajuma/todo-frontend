import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import styles from '../styles/Home.module.scss'

const apiOrigin = process.env.NEXT_PUBLIC_API_SERVER

interface task {
  id: number
  title: string
  done: boolean
}

const Home: NextPage = () => {
  const [tasks, setTasks] = useState<task[]>([])
  const [inputValue, setInputValue] = useState("")
  const [selectedId,setSelectedId] = useState(-1)

  const getTasks = async () => {
    const res = await fetch(`${apiOrigin}/tasks`)
    const data = await res.json()
    setTasks(data)
  }

  useEffect(() => {
    getTasks()
  },[selectedId])
  
  const handleChenge = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await fetch(`${apiOrigin}/tasks`,{method: "POST",headers: {'Content-Type': 'application/json'},body: JSON.stringify({"title": inputValue})})
    await getTasks()
    setInputValue("")
  }

  const handleDelete = async (id: number) => {
    await fetch(`${apiOrigin}/tasks/${id}`,{method: "DELETE",headers: {'Content-Type': 'application/json'}})
    await getTasks()
  }

  const handleSelect = async (id :number) => {
    if (selectedId === -1) {
      setSelectedId(id)
    } else {
      const i = tasks.findIndex((task) => task.id === selectedId)
      await fetch(`${apiOrigin}/tasks/${selectedId}`,{method: "PUT",headers: {'Content-Type': 'application/json'},body: JSON.stringify({"title": tasks[i].title})})
      setSelectedId(-1)
    }
  }

  const handleEdit = (e: ChangeEvent<HTMLInputElement>,id: number) => {
    const newTasks = tasks.map((task) => {
      if (task.id === id) {
        task.title = e.target.value
      }
    return task
    })
    setTasks(newTasks)
  }

  const handleDone = async (task: task) => {
    if (task.done === true) {
      await fetch(`${apiOrigin}/tasks/${task.id}/done`,{method: "DELETE",headers: {'Content-Type': 'application/json'}})
    } else {
      await fetch(`${apiOrigin}/tasks/${task.id}/done`,{method: "PUT",headers: {'Content-Type': 'application/json'}})
    }
    getTasks()
  }
  

  return (
    <div className={styles.content}>
      <h1>Todoリスト - 忘れないために</h1>
      <header>
        <div>
          <h2>タスクの追加</h2>
          <form onSubmit={(e) => handleSubmit(e)}>
            <input type="text" onChange={(e) => handleChenge(e)} />
            <input type="submit" value="ADD"/>
          </form>
        </div>
      </header>
      <main>
        <div>{tasks.map((task: task) => (
          <div className={styles.task} key={task.id}>
            {selectedId === task.id ? <input type="text" value={task.title} onChange={(e) => handleEdit(e,task.id)} /> : <input type="text" value={task.title} readOnly />}
            <div>
              {selectedId === task.id ? <button className={styles.sEdit} onClick={() => handleSelect(task.id)}>Edit</button> : <button className={styles.edit} onClick={() => handleSelect(task.id)}>Edit</button>}
              {task.done === true ? <button className={styles.sdone} onClick={() => handleDone(task)}>Done</button> : <button className={styles.done} onClick={() => handleDone(task)}>Done</button> }
              <button className={styles.delete} onClick={() => handleDelete(task.id)}>DELETE</button>
            </div>
          </div>
        ))}</div>
      </main>
    </div>
  )
}

export default Home
