import React, { useState, useEffect } from 'react';
import { ListGroup, Button, Spinner } from 'react-bootstrap';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, clearReadNotifications } from '../../services/notificationService';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ onNotificationsRead }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [notificationsMap, setNotificationsMap] = useState(new Map());

  // Effect to convert map to array for rendering
  useEffect(() => {
    const notificationArray = Array.from(notificationsMap.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setNotifications(notificationArray);
  }, [notificationsMap]);

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      console.log("Fetching notifications for page:", page);
      const response = await getNotifications(page);
      console.log("Received notifications:", response);
      
      if (!response.notifications || response.notifications.length === 0) {
        setHasMore(false);
      } else {
        // Add new notifications to the map to ensure uniqueness
        setNotificationsMap(prevMap => {
          const newMap = new Map(prevMap);
          response.notifications.forEach(notification => {
            if (notification && notification.id) {
              newMap.set(notification.id, notification);
            }
          });
          return newMap;
        });
        
        setPage(prevPage => prevPage + 1);
        
        if (response.currentPage + 1 >= response.totalPages) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id);
        
        // Update state to mark notification as read
        setNotificationsMap(prevMap => {
          const newMap = new Map(prevMap);
          if (newMap.has(notification.id)) {
            newMap.set(notification.id, { ...notification, read: true });
          }
          return newMap;
        });
        
        // Update unread count in parent component
        onNotificationsRead(1);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoadingAction(true);
      await markAllNotificationsAsRead();
      
      // Count unread notifications
      const unreadCount = notifications.filter(n => !n.read).length;
      
      // Update all notifications to read
      setNotificationsMap(prevMap => {
        const newMap = new Map(prevMap);
        prevMap.forEach((notification, id) => {
          newMap.set(id, { ...notification, read: true });
        });
        return newMap;
      });
      
      // Update parent component
      onNotificationsRead(unreadCount);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleClearReadNotifications = async () => {
    try {
      setLoadingAction(true);
      await clearReadNotifications();
      
      // Remove read notifications from state
      setNotificationsMap(prevMap => {
        const newMap = new Map();
        prevMap.forEach((notification, id) => {
          if (!notification.read) {
            newMap.set(id, notification);
          }
        });
        return newMap;
      });
    } catch (error) {
      console.error('Error clearing read notifications:', error);
    } finally {
      setLoadingAction(false);
    }
  };

  const hasUnread = notifications.some(n => !n.read);
  const hasRead = notifications.some(n => n.read);

  return (
    <div className="notification-dropdown">
      <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
        <h6 className="m-0">Notifications</h6>
        <div className="d-flex">
          {hasRead && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-decoration-none p-0 me-3" 
              onClick={handleClearReadNotifications}
              disabled={loadingAction}
            >
              {loadingAction ? 'Clearing...' : 'Clear read'}
            </Button>
          )}
          {hasUnread && (
            <Button 
              variant="link" 
              size="sm" 
              className="text-decoration-none p-0" 
              onClick={handleMarkAllAsRead}
              disabled={loadingAction}
            >
              {loadingAction ? 'Processing...' : 'Mark all read'}
            </Button>
          )}
        </div>
      </div>
      
      <ListGroup className="notification-list">
        {notifications.length === 0 ? (
          <div className="text-center p-3 text-muted">
            {loading ? 'Loading notifications...' : 'No notifications'}
          </div>
        ) : (
          <>
            {notifications.map(notification => (
              <NotificationItem 
                key={`notification-${notification.id}`} 
                notification={notification} 
                onClick={handleNotificationClick}
              />
            ))}
            
            {hasMore && (
              <div className="text-center p-2">
                <Button 
                  variant="link" 
                  size="sm" 
                  disabled={loading} 
                  onClick={fetchNotifications}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </ListGroup>
    </div>
  );
};

export default NotificationDropdown;
