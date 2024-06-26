"""init

Revision ID: 350fb5cf1cb5
Revises: 
Create Date: 2024-04-29 05:38:17.224277

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '350fb5cf1cb5'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('gizi',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.Text(), nullable=False),
    sa.Column('age', sa.Integer(), nullable=False),
    sa.Column('gender', sa.Boolean(), nullable=False),
    sa.Column('born_weight', sa.Double(), nullable=False),
    sa.Column('born_height', sa.Double(), nullable=False),
    sa.Column('weight', sa.Double(), nullable=False),
    sa.Column('height', sa.Double(), nullable=False),
    sa.Column('status', sa.Text(), nullable=False),
    sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('models',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('loss', sa.Text(), nullable=False),
    sa.Column('alpha', sa.Double(), nullable=False),
    sa.Column('max_iter', sa.Integer(), nullable=False),
    sa.Column('testsize', sa.Double(), nullable=True),
    sa.Column('accuracy', sa.Double(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('learning_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('results',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('model_id', sa.Integer(), nullable=True),
    sa.Column('fold', sa.Integer(), nullable=True),
    sa.Column('actual', sa.Text(), nullable=True),
    sa.Column('predicted', sa.Text(), nullable=True),
    sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['model_id'], ['models.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('results')
    op.drop_table('models')
    op.drop_table('gizi')
    # ### end Alembic commands ###
