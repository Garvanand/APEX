import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Double, JSON, BigInteger
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    auth_tokens = relationship("AuthToken", back_populates="user", cascade="all, delete-orphan")
    device_registrations = relationship("DeviceRegistration", back_populates="user", cascade="all, delete-orphan")
    cognitive_states = relationship("CognitiveState", back_populates="user", cascade="all, delete-orphan")
    deadlines = relationship("Deadline", back_populates="user", cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = 'user_preferences'

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    dnd_during_flow = Column(Boolean, default=True, nullable=False)
    socratic_challenge_level = Column(String(20), default='medium', nullable=False)
    environment_sculpt_enabled = Column(Boolean, default=True, nullable=False)
    screen_greyscale_trigger = Column(String(20), default='Fatigued', nullable=False)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="preferences")

class AuthToken(Base):
    __tablename__ = 'auth_tokens'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    refresh_token = Column(String(512), unique=True, nullable=False, index=True)
    is_revoked = Column(Boolean, default=False, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", back_populates="auth_tokens")

class DeviceRegistration(Base):
    __tablename__ = 'device_registrations'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    device_id = Column(String(255), unique=True, nullable=False, index=True)
    device_type = Column(String(50), nullable=False)
    push_token = Column(String(512), nullable=True)
    last_seen_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="device_registrations")

class RawSignal(Base):
    __tablename__ = 'raw_signals'
    __table_args__ = {'postgresql_partition_by': 'RANGE (timestamp)'}

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    device_id = Column(String(255), nullable=False)
    timestamp = Column(DateTime(timezone=True), primary_key=True, nullable=False)
    heart_rate = Column(Double, nullable=True)
    hrv = Column(Double, nullable=True)
    blink_rate = Column(Integer, nullable=True)
    screen_interaction = Column(Double, nullable=True)
    active_app = Column(String(100), nullable=True)
    ambient_db = Column(Double, nullable=True)

class CognitiveState(Base):
    __tablename__ = 'cognitive_states'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    state = Column(String(20), nullable=False)
    confidence = Column(Double, nullable=False)
    determined_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    duration_seconds = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="cognitive_states")

class Deadline(Base):
    __tablename__ = 'deadlines'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=False)
    priority = Column(Integer, default=3, nullable=False)
    status = Column(String(50), default='pending', nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="deadlines")


class Agent(Base):
    __tablename__ = 'agents'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_name = Column(String(100), unique=True, nullable=False)
    version = Column(String(20), nullable=False)
    status = Column(String(50), default='active', nullable=False)


class AgentLog(Base):
    __tablename__ = 'agent_logs'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    agent_id = Column(UUID(as_uuid=True), ForeignKey('agents.id'), nullable=False)
    action_taken = Column(String(100), nullable=False)
    execution_details = Column(JSONB, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)


class AgentApproval(Base):
    __tablename__ = 'agent_approvals'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    action_id = Column(UUID(as_uuid=True), nullable=False)
    action_type = Column(String(100), nullable=False)
    status = Column(String(20), default='pending', nullable=False)
    payload = Column(JSONB, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

