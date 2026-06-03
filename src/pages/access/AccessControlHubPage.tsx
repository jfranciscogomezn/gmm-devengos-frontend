import { Link } from 'react-router-dom';
import { Card, Col, Row } from 'react-bootstrap';
import { Key, People, UiChecksGrid } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

export function AccessControlHubPage() {
  const { t } = useTranslation('access');

  const cards = [
    {
      titleKey: 'hub.menuCatalogue.title',
      descriptionKey: 'hub.menuCatalogue.description',
      openKey: 'hub.menuCatalogue.open',
      to: '/admin/access/menu',
      icon: <UiChecksGrid size={28} className="text-primary" />,
    },
    {
      titleKey: 'hub.roles.title',
      descriptionKey: 'hub.roles.description',
      openKey: 'hub.roles.open',
      to: '/admin/access/roles',
      icon: <Key size={28} className="text-primary" />,
    },
    {
      titleKey: 'hub.users.title',
      descriptionKey: 'hub.users.description',
      openKey: 'hub.users.open',
      to: '/admin/access/users',
      icon: <People size={28} className="text-primary" />,
    },
  ] as const;

  return (
    <div>
      <h4 className="mb-2">{t('hub.title')}</h4>
      <p className="text-muted mb-4">{t('hub.subtitle')}</p>
      <Row xs={1} md={3} className="g-3">
        {cards.map((card) => (
          <Col key={card.to}>
            <Card className="h-100 shadow-sm">
              <Card.Body className="d-flex flex-column">
                <div className="mb-3">{card.icon}</div>
                <Card.Title className="fs-6">{t(card.titleKey)}</Card.Title>
                <Card.Text className="text-muted small flex-grow-1">{t(card.descriptionKey)}</Card.Text>
                <Link to={card.to} className="btn btn-outline-primary btn-sm align-self-start">
                  {t(card.openKey)}
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
