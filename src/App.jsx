import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const TaskManager = () => {
  // Состояния
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    executor: '',
    deadline: '',
    status: 'Активная задача'
  });

  // Константы
  const STATUS_OPTIONS = ['Активная задача', 'Задача выполнена', 'Задача отменена'];
  const editInputRef = useRef(null);

  // Фильтрация задач
  const filteredTasks = useCallback(() => {
    if (filter === 'active') {
      return tasks.filter(task => task.status === 'Активная задача');
    }
    if (filter === 'completed') {
      return tasks.filter(task => ['Задача выполнена', 'Задача отменена'].includes(task.status));
    }
    return tasks;
  }, [tasks, filter]);

  // Обработчики
  const handleAddTask = () => {
    const { title, description, executor, deadline } = newTask;
    
    if (!title.trim()) return alert('Введите название задачи');
    if (!description.trim()) return alert('Введите описание задачи');
    if (!executor.trim()) return alert('Укажите исполнителя');
    if (!deadline) return alert('Укажите дедлайн');

    const task = {
      id: Date.now(),
      ...newTask
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      executor: '',
      deadline: '',
      status: 'Активная задача'
    });
    setShowPopup(false);
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const handleStartEdit = (taskId, field) => {
    setEditingTaskId(taskId);
    setEditingField(field);
  };

  const handleSaveEdit = (taskId, field, value) => {
    if (!value.trim()) {
      alert('Поле не может быть пустым');
      return;
    }

    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    );

    setEditingTaskId(null);
    setEditingField(null);
  };

  const handleBlurSave = (taskId, field, e) => {
    const value = e.target.value || e.target.textContent;
    handleSaveEdit(taskId, field, value);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setEditingTaskId(null);
    setEditingField(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Рендеринг ячейки
  const renderEditableCell = (task, field, content) => {
    const isEditing = editingTaskId === task.id && editingField === field;
    
    if (!isEditing) {
      return <div onClick={() => handleStartEdit(task.id, field)}>{content}</div>;
    }

    const commonProps = {
      ref: editInputRef,
      defaultValue: task[field],
      onBlur: (e) => handleBlurSave(task.id, field, e),
      autoFocus: true
    };

    switch (field) {
      case 'description':
        return <textarea {...commonProps} />;
      case 'status':
        return (
          <select
            {...commonProps}
            onChange={(e) => handleStatusChange(task.id, e.target.value)}
            onBlur={() => {
              setEditingTaskId(null);
              setEditingField(null);
            }}
          >
            {STATUS_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'deadline':
        return <input type="date" {...commonProps} />;
      default:
        return <input type="text" {...commonProps} />;
    }
  };

  // Рендеринг таблицы
  const renderTable = () => {
    const tasksToShow = filteredTasks();
    
    if (tasksToShow.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="empty-message">
            Нет задач для отображения
          </td>
        </tr>
      );
    }

    return tasksToShow.map(task => (
      <tr key={task.id}>
        <td className="editable-cell">
          {renderEditableCell(task, 'title', task.title)}
        </td>
        <td className="editable-cell">
          {renderEditableCell(task, 'description', task.description)}
        </td>
        <td className="editable-cell">
          {renderEditableCell(task, 'executor', task.executor)}
        </td>
        <td className="editable-cell">
          {renderEditableCell(task, 'deadline', formatDate(task.deadline))}
        </td>
        <td className="editable-cell">
          {editingTaskId === task.id && editingField === 'status' ? (
            renderEditableCell(task, 'status', task.status)
          ) : (
            <span className={`status-badge status-${task.status.replace(/\s+/g, '-').toLowerCase()}`}>
              {task.status}
            </span>
          )}
        </td>
        <td>
          <button className="delete-btn" onClick={() => handleDeleteTask(task.id)}>
            Удалить
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Управление задачами</h1>
      </header>

      <div className="container">
        <div className="filters">
          {['all', 'active', 'completed'].map(type => (
            <button
              key={type}
              className={`filter-btn ${filter === type ? 'active' : ''}`}
              onClick={() => setFilter(type)}
            >
              {type === 'all' && 'Все задачи'}
              {type === 'active' && 'Активные'}
              {type === 'completed' && 'Завершенные'}
            </button>
          ))}
        </div>

        <div className="add-task-section">
          <button className="add-btn" onClick={() => setShowPopup(true)}>
            + Новая задача
          </button>
        </div>

        <div className="table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Описание</th>
                <th>Исполнитель</th>
                <th>Дедлайн</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {renderTable()}
            </tbody>
          </table>
        </div>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup">
              <div className="popup-header">
                <h2>Создание задачи</h2>
                <button className="close-btn" onClick={() => setShowPopup(false)}>
                  ×
                </button>
              </div>
              <div className="popup-body">
                {['title', 'description', 'executor', 'deadline', 'status'].map(field => (
                  <div key={field} className="form-group">
                    <label>
                      {field === 'title' && 'Название задачи *'}
                      {field === 'description' && 'Описание *'}
                      {field === 'executor' && 'Исполнитель *'}
                      {field === 'deadline' && 'Дедлайн *'}
                      {field === 'status' && 'Статус'}
                    </label>
                    {field === 'description' ? (
                      <textarea
                        value={newTask[field]}
                        onChange={(e) => setNewTask(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={`Введите ${field === 'title' ? 'название' : field === 'executor' ? 'имя исполнителя' : 'описание'}`}
                      />
                    ) : field === 'status' ? (
                      <select
                        value={newTask[field]}
                        onChange={(e) => setNewTask(prev => ({ ...prev, [field]: e.target.value }))}
                      >
                        {STATUS_OPTIONS.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : field === 'deadline' ? (
                      <input
                        type="date"
                        value={newTask[field]}
                        onChange={(e) => setNewTask(prev => ({ ...prev, [field]: e.target.value }))}
                      />
                    ) : (
                      <input
                        type="text"
                        value={newTask[field]}
                        onChange={(e) => setNewTask(prev => ({ ...prev, [field]: e.target.value }))}
                        placeholder={`Введите ${field === 'title' ? 'название' : 'имя исполнителя'}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="popup-footer">
                <button className="cancel-btn" onClick={() => setShowPopup(false)}>
                  Отмена
                </button>
                <button className="create-btn" onClick={handleAddTask}>
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;