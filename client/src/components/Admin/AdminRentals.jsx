// import { useState, useEffect } from 'react';
// import { Card, Table, Button, Badge, Row, Col, Spinner } from 'react-bootstrap';
// import { contactAPI } from '../../services/api';
// import { toast } from 'react-toastify';
//
// const AdminRentals = () => {
//     const [expiringContacts, setExpiringContacts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [sendingReminders, setSendingReminders] = useState(false);
//
//     useEffect(() => {
//         fetchExpiringRentals();
//     }, []);
//
//     const fetchExpiringRentals = async () => {
//         setLoading(true);
//         try {
//             const response = await contactAPI.getExpiringRentals();
//             setExpiringContacts(response.data.contacts);
//         } catch (error) {
//             toast.error('Failed to load expiring rentals');
//             console.error('Error:', error);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     const handleSendReminders = async () => {
//         setSendingReminders(true);
//         try {
//             const response = await contactAPI.sendReminders();
//             toast.success(response.data.message);
//             fetchExpiringRentals();
//         } catch (error) {
//             toast.error('Failed to send reminders');
//             console.error('Error:', error);
//         } finally {
//             setSendingReminders(false);
//         }
//     };
//
//     if (loading) {
//         return (
//             <div className="text-center py-5">
//                 <Spinner animation="border" />
//                 <p className="mt-3">Loading expiring rentals...</p>
//             </div>
//         );
//     }
//
//     return (
//         <div className="container-fluid py-4">
//             <Row className="mb-4">
//                 <Col>
//                     <h1 className="h2 mb-4">Expiring Rentals</h1>
//                     <div className="d-flex justify-content-between align-items-center mb-4">
//                         <div>
//                             <Badge bg="warning" className="fs-6 p-2">
//                                 {expiringContacts.length} rentals expiring soon
//                             </Badge>
//                         </div>
//                         <Button
//                             variant="primary"
//                             onClick={handleSendReminders}
//                             disabled={sendingReminders || expiringContacts.length === 0}
//                         >
//                             {sendingReminders ? 'Sending...' : 'Send All Reminders'}
//                         </Button>
//                     </div>
//                 </Col>
//             </Row>
//
//             {expiringContacts.length > 0 ? (
//                 <Card>
//                     <Card.Body>
//                         <Table responsive>
//                             <thead>
//                             <tr>
//                                 <th>Client</th>
//                                 <th>Website</th>
//                                 <th>Expires</th>
//                                 <th>Days Left</th>
//                                 <th>Price</th>
//                                 <th>Actions</th>
//                             </tr>
//                             </thead>
//                             <tbody>
//                             {expiringContacts.map(contact => (
//                                 <tr key={contact.id}>
//                                     <td>
//                                         <div>
//                                             <strong>{contact.name}</strong>
//                                             <div className="text-muted small">{contact.email}</div>
//                                             {contact.phone && (
//                                                 <div className="text-muted small">{contact.phone}</div>
//                                             )}
//                                         </div>
//                                     </td>
//                                     <td>{contact.siteTitle || 'N/A'}</td>
//                                     <td>
//                                         {new Date(contact.rentalEndDate).toLocaleDateString()}
//                                         <div className="text-muted small">
//                                             {new Date(contact.rentalEndDate).toLocaleTimeString()}
//                                         </div>
//                                     </td>
//                                     <td>
//                                         <Badge bg={contact.daysRemaining <= 1 ? 'danger' : 'warning'}>
//                                             {contact.daysRemaining} days
//                                         </Badge>
//                                     </td>
//                                     <td>${contact.monthlyPrice}/month</td>
//                                     <td>
//                                         <Button
//                                             variant="outline-primary"
//                                             size="sm"
//                                             href={`/admin/contacts/${contact.id}`}
//                                             className="me-2"
//                                         >
//                                             View
//                                         </Button>
//                                         <Button
//                                             variant="outline-success"
//                                             size="sm"
//                                             onClick={() => {
//                                                 // Здесь можно добавить быстрый платеж
//                                             }}
//                                         >
//                                             Add Payment
//                                         </Button>
//                                     </td>
//                                 </tr>
//                             ))}
//                             </tbody>
//                         </Table>
//                     </Card.Body>
//                 </Card>
//             ) : (
//                 <Card>
//                     <Card.Body className="text-center py-5">
//                         <h5>No rentals expiring soon</h5>
//                         <p className="text-muted">All rentals are up to date!</p>
//                     </Card.Body>
//                 </Card>
//             )}
//         </div>
//     );
// };
//
// export default AdminRentals;