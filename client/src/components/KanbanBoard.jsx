import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';
import TaskForm from './TaskForm';

const KanbanBoard = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get(`/tasks?projectId=${projectId}`);
        setTasks(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
        setLoading(false);
      }
    };
    fetchTasks();
  }, [projectId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Optimistic Update
    const newStatus = destination.droppableId;

    // Create new tasks array
    const newTasks = tasks.map(t =>
        t._id === draggableId ? { ...t, status: newStatus } : t
    );
    setTasks(newTasks);

    // API Call
    try {
        await api.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
        console.error("Failed to update task status", err);
    }
  };

  const handleCreateClick = () => {
      setEditingTask(null);
      setIsFormOpen(true);
  };

  const handleEditClick = (task) => {
      setEditingTask(task);
      setIsFormOpen(true);
  };

  const handleSaveTask = async (taskData) => {
      try {
          if (editingTask) {
              const res = await api.put(`/tasks/${editingTask._id}`, taskData);
              setTasks(prev => prev.map(t => t._id === res.data._id ? res.data : t));
          } else {
              const res = await api.post('/tasks', taskData);
              setTasks(prev => [res.data, ...prev]);
          }
          setIsFormOpen(false);
      } catch (err) { // eslint-disable-line no-unused-vars
          alert('Failed to save task');
      }
  };

  const handleDeleteTask = async (taskId) => {
      if(window.confirm("Delete this task?")) {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(prev => prev.filter(t => t._id !== taskId));
        } catch(err) { // eslint-disable-line no-unused-vars
            alert('Failed to delete task');
        }
      }
  }

  const columns = {
    'To Do': tasks.filter(t => t.status === 'To Do'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Review': tasks.filter(t => t.status === 'Review'),
    'Done': tasks.filter(t => t.status === 'Done')
  };

  if (loading) return <div>Loading Board...</div>;

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Kanban Board</h2>
        <button onClick={handleCreateClick} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + New Task
        </button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex h-full gap-4 overflow-x-auto pb-4">
          {Object.entries(columns).map(([columnId, columnTasks]) => (
            <div key={columnId} className="bg-gray-100 rounded-lg p-4 min-w-[300px] flex flex-col h-full">
              <h3 className="font-bold mb-4 text-gray-700 flex justify-between">
                  {columnId}
                  <span className="bg-gray-200 text-gray-600 px-2 rounded-full text-sm">{columnTasks.length}</span>
              </h3>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex-1 overflow-y-auto min-h-[100px]"
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-3 rounded shadow mb-3 border-l-4 ${
                                task.priority === 'Urgent' ? 'border-red-500' :
                                task.priority === 'High' ? 'border-orange-500' :
                                task.priority === 'Medium' ? 'border-blue-500' :
                                'border-green-500'
                            } hover:shadow-md transition-shadow select-none`}
                            style={{ ...provided.draggableProps.style }}
                          >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-medium text-gray-800">{task.title}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleEditClick(task)} className="text-gray-400 hover:text-blue-500">
                                        ✎
                                    </button>
                                     <button onClick={() => handleDeleteTask(task._id)} className="text-gray-400 hover:text-red-500">
                                        ×
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                                <span>{task.assignee ? task.assignee.name.split(' ')[0] : 'Unassigned'}</span>
                                {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {isFormOpen && (
        <TaskForm
            projectId={projectId}
            task={editingTask}
            onSave={handleSaveTask}
            onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
