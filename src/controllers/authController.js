import pool from '../config/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

// ======================
// REGISTER
// ======================

export const register = async (req, res, next) => {
  try {
    const {
      nombre,
      email,
      password,
      empresa
    } = req.body

    // validar usuario existente
    const existingUser = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        message: 'El email ya existe'
      })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // crear empresa
    const empresaResult = await pool.query(
      `INSERT INTO empresas (nombre)
       VALUES ($1)
       RETURNING *`,
      [empresa]
    )

    const empresaId = empresaResult.rows[0].id

    // crear usuario arquitecto
    const userResult = await pool.query(
      `INSERT INTO usuarios
      (nombre, email, password, rol, empresa_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nombre, email, rol, empresa_id`,
      [
        nombre,
        email,
        hashedPassword,
        'arquitecto',
        empresaId
      ]
    )

    const user = userResult.rows[0]

    // JWT
    const token = jwt.sign(
      {
        id: user.id,
        empresa_id: user.empresa_id,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    res.status(201).json({
      message: 'Usuario registrado',
      token,
      user
    })

  } catch (error) {
    next(error)
  }
}

// ======================
// LOGIN
// ======================

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [email]
    )

    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no encontrado'
      })
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return res.status(401).json({
        message: 'Password incorrecta'
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        empresa_id: user.empresa_id,
        rol: user.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        empresa_id: user.empresa_id
      }
    })

  } catch (error) {
    next(error)
  }
}
