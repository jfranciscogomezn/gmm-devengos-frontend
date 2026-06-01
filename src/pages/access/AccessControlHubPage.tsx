import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import { Key, People, UiChecksGrid } from 'react-bootstrap-icons';

const cards = [
  {
    title: 'Menu Catalogue',
    description: 'Browse the global navigation structure (modules, groups, and screens).',
    to: '/admin/access/menu',
    icon: <UiChecksGrid size={28} className="text-primary" />,
  },
  {
    title: 'Roles & Permissions',
    description: 'Define roles and assign which menu screens each role can access.',
    to: '/admin/access/roles',
    icon: <Key size={28} className="text-primary" />,
  },
  {
    title: 'Users & Roles',
    description: 'Manage user accounts and link each user to a role.',
    to: '/admin/access/users',
    icon: <People size={28} className="text-primary" />,
  },
];

export function AccessControlHubPage() {
  return (
    <div>
      <h4 className="mb-2">Access Control</h4>
      <p className="text-muted mb-4">
        Central administration for navigation, role permissions, and user assignments.
      </p>
      <Row xs={1} md={3} className="g-3">
        {cards.map((card) => (
          <Col key={card.to}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="mb-3">{card.icon}</div>
                <Card.Title className="fs-6">{card.title}</Card.Title>
                <Card.Text className="text-muted small flex-grow-1">{card.description}</Card.Text>
                <Link to={card.to} className="btn btn-outline-primary btn-sm align-self-start">
                  Open
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
