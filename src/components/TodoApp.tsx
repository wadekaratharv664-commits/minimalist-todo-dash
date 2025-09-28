import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

const TodoApp = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const { toast } = useToast();

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('todos');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
        }));
        setTasks(parsedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        text: newTaskText.trim(),
        completed: false,
        createdAt: new Date(),
      };
      setTasks([newTask, ...tasks]);
      setNewTaskText('');
      toast({
        title: "Task added",
        description: "Your new task has been added successfully.",
      });
    }
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Task deleted",
      description: "Task has been removed from your list.",
      variant: "destructive",
    });
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditingText(text);
  };

  const saveEdit = () => {
    if (editingText.trim() && editingId) {
      setTasks(tasks.map(task => 
        task.id === editingId ? { ...task, text: editingText.trim() } : task
      ));
      setEditingId(null);
      setEditingText('');
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="min-h-screen bg-gradient-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
            My Tasks
          </h1>
          <p className="text-muted-foreground text-lg">
            Stay organized and productive
          </p>
        </div>

        {/* Add Task Section */}
        <Card className="p-6 mb-8 shadow-soft border-0 bg-card/80 backdrop-blur-sm">
          <div className="flex gap-3">
            <Input
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 border-border/50 bg-background/50"
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <Button 
              onClick={addTask}
              className="bg-gradient-primary hover:opacity-90 transition-opacity px-6"
              disabled={!newTaskText.trim()}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add
            </Button>
          </div>
        </Card>

        {/* Tasks Statistics */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="p-4 text-center shadow-soft border-0 bg-card/80">
              <div className="text-2xl font-bold text-primary">{tasks.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </Card>
            <Card className="p-4 text-center shadow-soft border-0 bg-card/80">
              <div className="text-2xl font-bold text-muted-foreground">{pendingTasks.length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </Card>
            <Card className="p-4 text-center shadow-soft border-0 bg-card/80">
              <div className="text-2xl font-bold text-success">{completedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Done</div>
            </Card>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <Card className="p-12 text-center shadow-soft border-0 bg-card/80">
              <div className="text-muted-foreground text-lg">
                No tasks yet. Add your first task above!
              </div>
            </Card>
          ) : (
            tasks.map((task) => (
              <Card 
                key={task.id}
                className={`p-4 shadow-soft border-0 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-medium ${
                  task.completed ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex-shrink-0 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                    )}
                  </button>

                  {editingId === task.id ? (
                    <div className="flex-1 flex gap-2">
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 border-border/50"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                      />
                      <Button size="sm" onClick={saveEdit} className="bg-success">
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div 
                        className={`flex-1 ${
                          task.completed 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                        }`}
                      >
                        {task.text}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(task.id, task.text)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoApp;